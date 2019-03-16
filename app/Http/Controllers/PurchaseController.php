<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Kernel;
use Validator;
use App\PurchaseOrder;
use App\Supplier;
use App\PurchaseItems;
use App\Purchase;
use App\Item;
use Carbon\Carbon;
use App\Unit;
use App\Category;

class PurchaseController extends Controller
{
	public function index()
	{
		$purchase = Purchase::with(['employees','supplier','purchaseOrder.purchaseOrderItems.item','purchaseOrder.purchaseOrderItems.item.unit','purchaseItems.item.category','purchaseItems.item.unit'])->get();
		return response()->json($purchase, 200);
	}

	public function show(Purchase $purchase)
	{
		$purchase = Purchase::with(['employees','supplier','purchaseOrder.purchaseOrderItems.item','purchaseOrder.purchaseOrderItems.item.unit','purchaseItems.item.category','purchaseItems.item.unit'])
		->where('id',$purchase->id)->first();
		return response()->json($purchase,200);
	}

	public function store(Request $request)
	{
		$Obj = $request->all();
		$response = array();
        $boolIsCatCreate = true;
        $boolIsUnitCreate = true;

		$validator = Validator::make($Obj,[
			'mrn_date' => 'required',
			'supplierId' => 'required',
			'supplier_bill_no' =>'required |unique:purchases',
			'supplier_bill_date' => 'required',
			'purchase_mode' => 'required',
			'received_by' => 'required'
		]);
		if($validator->fails()){
                return $this->respondWithError($validator->errors());   
            }

            $response["status"] = "success";
            $purchase = Purchase::create($request->all());
            if($purchase->poId !== null){
            $pOrder = PurchaseOrder::find($purchase->poId);
            $pOrder->status = 'Completed';
            $pOrder->save();
            }
            $purchase_items = $request->all();
            if(count($purchase_items["purchaseItems"]) !== 0)
            {
                for($i=0;$i < (count($purchase_items["purchaseItems"]));$i++)
                {
                    if($purchase_items["purchaseItems"][$i]["itemId"] == null)
                    {

                     $cat = Category::where("parent_category","<>", 0)
                    ->where("categorie", "like", $purchase_items["purchaseItems"][$i]['categorie'])
                    ->get();

                     if($cat->isEmpty()){
                        if($boolIsCatCreate){
                            $newCat = Category::insertGetId(array(
                                "categorie" => $purchase_items["purchaseItems"][$i]['categorie'],
                                "parent_category" => 1,
                                "created_at"  => Carbon::now(),
                                "updated_at" => Carbon::now()
                                ));
                        }else{
                            $newCat =0;
                        }
                        
                    }else{
                        $newCat = $cat->first()->id;
                    }

                    $unittrim=trim($purchase_items["purchaseItems"][$i]['unit']);
                    $unit = Unit::where("unit", "like",$unittrim)->get();
    
                    if($unit->isEmpty()){
                        if($boolIsUnitCreate){
                            $newUnit = Unit::insertGetId(array(
                                "unit" => $purchase_items["purchaseItems"][$i]['unit'],
                                "created_at"  => Carbon::now(),
                                "updated_at" => Carbon::now()
                                ));
                        }else{
                            $newUnit = 0;
                        }
                        
                    }else{
                        $newUnit = $unit->first()->id;
                    }

                     $newItem = Item::insertGetId(array(
                                        'category' => $newCat,
                                        'barcode' => $purchase_items["purchaseItems"][$i]['barcode'], 
                                        'itemName' => $purchase_items["purchaseItems"][$i]['itemName'],
                                        'costPrice' => $purchase_items["purchaseItems"][$i]['rate'],
                                        'salePrice' => $purchase_items["purchaseItems"][$i]['mrp'],
                                        'unit' => $newUnit,
                                        'stock' => $purchase_items["purchaseItems"][$i]['quantity'],
                                        'itemType'=> $purchase_items["purchaseItems"][$i]['itemType'],
                                        'cp_vat' => $purchase_items['purchaseItems'][$i]['cp_vat'],
                                        "created_at"  => Carbon::now(),
                                        "updated_at" => Carbon::now(),
                                        ));
                    
                   $purchase_items['purchaseItems'][$i]['itemId'] = $newItem;
                    $purchase_items['purchaseItems'][$i]['unitId'] = $newUnit;
                    $id = $purchase_items['purchaseItems'][$i]['itemId'];
                    $item = Item::find($id);
                    // $item->stock = $item->stock + $purchase_items['purchaseItems'][$i]['quantity'];
                    // $item->save(); 
                    $purchase_items["purchaseItems"][$i]["purchaseId"]=$purchase->id;
                    PurchaseItems::create($purchase_items["purchaseItems"][$i]);     
                    }
                    
                    else {
                    $id = $purchase_items["purchaseItems"][$i]['itemId'];
                    $item = Item::find($id);
                    $item->cp_vat = $purchase_items['purchaseItems'][$i]['cp_vat'];
                    $item->stock = $item->stock + $purchase_items['purchaseItems'][$i]['quantity'];
                    $item->save(); 
                    $purchase_items["purchaseItems"][$i]["purchaseId"]=$purchase->id;
                    PurchaseItems::create($purchase_items["purchaseItems"][$i]);
                    }
                }
            }
            // if(count($purchase_items["purchaseItems"]) !== 0){
            // 	for($i=0;$i < (count($purchase_items["purchaseItems"]));$i++)
            // 	{
            //         $id = $purchase_items["purchaseItems"][$i]['itemId'];
            //         $item = Item::find($id);
            //         $item->stock = $item->stock + $purchase_items['purchaseItems'][$i]['quantity'];
            //         $item->save(); 
            // 		$purchase_items["purchaseItems"][$i]["purchaseId"]=$purchase->id;
            //         PurchaseItems::create($purchase_items["purchaseItems"][$i]);
                   
            // 	}

            // }
            	 return response()->json($response , 200);
	}

	public function update(Request $request,Purchase $purchase)
	{
        $duplicate = false;
         $boolIsCatCreate = true;
        $boolIsUnitCreate = true;
		$inputData = $purchase;
        $response = array();
		$Obj = $request->all();
        $validator = Validator::make($Obj,[
			'mrn_date' => 'required',
			'supplierId' => 'required',
			'supplier_bill_no' =>'required |unique:purchases,supplier_bill_no,'.$Obj['id'].'',
			'supplier_bill_date' => 'required',
			'purchase_mode' => 'required',
			'received_by' => 'required'
		]);
		if($validator->fails()){
                return $this->respondWithError($validator->errors());   
            }

            if(count($Obj["purchaseItems"]) >= 1)
            {
            	for($i=0;$i<count($Obj["purchaseItems"]);$i++)
            	{
                      if ($Obj["purchaseItems"][$i]['quantity'] !="") {
                        $preQty = $Obj["purchaseItems"][$i]['quantity'];
                    }else{
                        $preQty = 0;
                    }

                    $purchase_items = $request->all();
            if(count($purchase_items["purchaseItems"]) !== 0)
            {
                for($i=0;$i < (count($purchase_items["purchaseItems"]));$i++)
                {
                    if($purchase_items["purchaseItems"][$i]["itemId"] == null)
                    {

                     $cat = Category::where("parent_category","<>", 0)
                    ->where("categorie", "like", $purchase_items["purchaseItems"][$i]['categorie'])
                    ->get();

                     if($cat->isEmpty()){
                        if($boolIsCatCreate){
                            $newCat = Category::insertGetId(array(
                                "categorie" => $purchase_items["purchaseItems"][$i]['categorie'],
                                "parent_category" => 1,
                                "created_at"  => Carbon::now(),
                                "updated_at" => Carbon::now()
                                ));
                        }else{
                            $newCat =0;
                        }
                        
                    }else{
                        $newCat = $cat->first()->id;
                    }

                    $unittrim=trim($purchase_items["purchaseItems"][$i]['unitId']);
                    $unit = Unit::where("unit", "like",$unittrim)->get();
    
                    if($unit->isEmpty()){
                        if($boolIsUnitCreate){
                            $newUnit = Unit::insertGetId(array(
                                "unit" => $purchase_items["purchaseItems"][$i]['unitId'],
                                "created_at"  => Carbon::now(),
                                "updated_at" => Carbon::now()
                                ));
                        }else{
                            $newUnit = 0;
                        }
                        
                    }else{
                        $newUnit = $unit->first()->id;
                    }

                     $newItem = Item::insertGetId(array(
                                        'category' => $newCat,
                                        'barcode' => $purchase_items["purchaseItems"][$i]['barcode'], 
                                        'itemName' => $purchase_items["purchaseItems"][$i]['itemName'],
                                        'costPrice' => $purchase_items["purchaseItems"][$i]['rate'],
                                        'salePrice' => $purchase_items["purchaseItems"][$i]['mrp'],
                                        'unit' => $newUnit,
                                        'stock' => $purchase_items["purchaseItems"][$i]['quantity'],
                                        'itemType'=> $purchase_items["purchaseItems"][$i]['itemType'],
                                        'cp_vat' => $purchase_items['purchaseItems'][$i]['cp_vat'],
                                        "created_at"  => Carbon::now(),
                                        "updated_at" => Carbon::now(),
                                        ));
                    
                   $purchase_items['purchaseItems'][$i]['itemId'] = $newItem;
                    $purchase_items['purchaseItems'][$i]['unitId'] = $newUnit;
                    $id = $purchase_items['purchaseItems'][$i]['itemId'];
                    $item = Item::find($id);
                    // $item->stock = $item->stock + $purchase_items['purchaseItems'][$i]['quantity'];
                    // $item->save(); 
                    $purchase_items["purchaseItems"][$i]["purchaseId"]=$purchase->id;
                    PurchaseItems::create($purchase_items["purchaseItems"][$i]);     
                    }
                    
                    else {
                    $id = $purchase_items["purchaseItems"][$i]['itemId'];
                    $item = Item::find($id);
                    $item->cp_vat = $purchase_items['purchaseItems'][$i]['cp_vat'];
                    $item->stock = $item->stock + $purchase_items['purchaseItems'][$i]['quantity'];
                    $item->save(); 
                    $purchase_items["purchaseItems"][$i]["purchaseId"]=$purchase->id;
                    PurchaseItems::create($purchase_items["purchaseItems"][$i]);
                    }
                }
            }
            		// if($Obj["purchaseItems"][$i]["id"]!="")
              //       {
              //           $updatePI = PurchaseItems::find($Obj["purchaseItems"][$i]["id"]);
                        if($Obj["purchaseItems"][$i]["deleted"] == false)
                        {

                            $updatePI->itemId = $Obj["purchaseItems"][$i]["itemId"];
                            // $updatePI->unitId =1;
                            $updatePI->quantity = $Obj["purchaseItems"][$i]["quantity"];
                            $updatePI->mrp = $Obj["purchaseItems"][$i]["mrp"];
                            $updatePI->rate = $Obj["purchaseItems"][$i]["rate"];
                            $updatePI->total_amount = $Obj["purchaseItems"][$i]["total_amount"];
                            $updatePI->discount_rate = $Obj["purchaseItems"][$i]["discount_rate"];
                            $updatePI->total_discount = $Obj["purchaseItems"][$i]["total_discount"];
                            $item = Item::find($Obj['purchaseItems'][$i]['itemId']);
                            $item->stock = $item->stock - $preQty + $Obj['purchaseItems'][$i]['quantity'];
                            $item->cp_vat = $Obj['purchaseItems'][$i]['cp_vat'];
                            $item->costPrice = $Obj['purchaseItems'][$i]['rate'];
                            $item->save(); 
                            $updatePI->save();

                        }else {
                             $item = Item::find($purchase['purchaseItems'][$i]['itemId']);
                             $item->stock = $item->stock - $purchase['purchaseItems'][$i]['quantity'];
                             $item->save(); 
                            $updatePI->delete();
                    }
            }

            $response["status"] = "success";
            $purchase->update($Obj);
             return response()->json($response, 200); 
	}
}
	 public function delete($id)
        {
            $purchase = Purchase::with(['purchaseItems'])->find($id);

            if(count($purchase['purchaseItems']) >=1)
            {
                for($i=0;$i<count($purchase['purchaseItems']);$i++)
                {
                      $item = Item::find($purchase['purchaseItems'][$i]['itemId']);
                      $item->stock = $item->stock - $purchase['purchaseItems'][$i]['quantity'];
                      $item->save();  
                    if($purchase['purchaseItems'][$i]['id'] !="")
                    {
                        $deletePurchase=PurchaseItems::find($purchase['purchaseItems'][$i]['id']);
                        $d = $deletePurchase->delete();
                    }
                }
            }
            $purchase->delete();
             if($purchase->poId !== null)
            {
            $pOrder = PurchaseOrder::find($purchase->poId);
            $pOrder->status = 'Pending';
            $pOrder->update();
            }
            
            return response()->json(null, 204);
           

        }

        public function filter(Request $request)
    {
        if($request->input('searchkey') !=null ){
        $purchase = Purchase::with(['purchaseItems','employees','supplier'])
        ->select('purchases.*')
        ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('supplierId','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('purchase_order_id','LIKE','%'.$request->input('searchkey').'%')
                 ->orWhere('supplier_bill_no','LIKE','%'.$request->input('searchkey').'%')
                 ->orWhere('supplier_bill_date','LIKE','%'.$request->input('searchkey').'%')
                 ->orWhere('bill_amount','LIKE','%'.$request->input('searchkey').'%')
                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('purchasesPerPage'));
         } else{
            $purchase = Purchase::with(['purchaseItems','supplier'])
            ->select('purchases.*')
            ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('purchasesPerPage'));
        }
        return response()->json($purchase, 200);
    }

     public function uploadItems(Request $request){
        ini_set("max_execution_time",6000);
        $i=0;
        $file = $request->file('items_import_file');
        // var_dump($file);
        $name = $file->getClientOriginalName();
        $items = array();
        $importedItems = $items;
        $duplicate = array();
        $addItems = array();
    
        $boolIsCatCreate = true;
    
        $boolIsUnitCreate = true;
    
        $boolIsItemUpdate = true;
    
        $boolIsItemCreate = true;
    
        $boolIsPurchaseItemsCreate = true;
    
        if(file_exists( storage_path() . '/import/' .$name)) {
            $actual_name = pathinfo($name,PATHINFO_FILENAME);
            $original_name = $actual_name;
            $extension = pathinfo($name, PATHINFO_EXTENSION);
            $actual_name = uniqid($original_name.'_');
            $name = $actual_name.".".$extension;
            $i++;
            $file->move(storage_path().'/import', $name); 
        } else {
            $file->move(storage_path().'/import', $name); 
        }
        $excelData = \Excel::load(storage_path().'/import/'. $name, function($reader) {})->get();
    
        // return $excelData;
        foreach ($excelData as $e) {
    
            $check = false;
            if($e->item_code!='') { 
    
                $it = Item::with(["category"])->where("barcode", "=", $e->item_code)->get();
    
                if(!$it->isEmpty() && $it[0]->category['categorie'] == $e->category){
    
                    $it_first = $it->first();
    
                    $conflict_check = \DB::table('items')
                    ->join('categories', 'items.category', '=', 'categories.id')
                    ->join('units', 'items.unit', '=', 'units.id')
                    ->where('categories.categorie','=', trim($e->category))
                    ->where('units.unit','=', trim($e->unit))
                    ->where("itemName", "=", trim($e->item_name))
                    ->where("barcode", "=", trim($e->item_code))
                    ->get();
    
                    if($conflict_check->isEmpty()){
                        $check = true;
                    }else{
                        $check = false;
                    }
    
                    $p = array(
                        "id" => $it_first->id, 
                        'category'  => $e->category ,
                        'barcode'  => $e->item_code,  
                        'itemName'  =>  $e->item_name,
                        'itemType'  =>  $e->item_type,
                        'unit'  =>  $e->unit,  
                        'costPrice'  =>  $e->cost_price,
                        'salePrice'  => $e->selling_price,
                        'cp_vat'   => $e->cp_vat,
                        'type'  => "old",
                        'conflict'  => $check,
                        'isItemCreate' => 'true',
                        );
                    $item = Item::find($p["id"]);
                    $unittrim=trim($p["unit"]);
                    $unit = Unit::where("unit", "like",$unittrim)->get();
    
                    if($unit->isEmpty()){
                        if($boolIsUnitCreate){
                            // $newUnit = Unit::insertGetId(array(
                            //     "unit" => $p["unit"],
                            //     "created_at"  => Carbon::now(),
                            //     "updated_at" => Carbon::now()
                            //     ));
                        }else{
                            $newUnit = 0;
                        }
                        
                    }else{
                        $newUnit = $unit->first()->id;
                    }
    
                    
    
                        if(! is_null($item)){
    
                            if($boolIsItemUpdate){
                                    $item->costPrice=$p["costPrice"];
                                    $item->salePrice=$p["salePrice"];
                                    $item->cp_vat=$p["cp_vat"];
                                    $item->unit=$newUnit;
                                    $item->save();
                            }
                        }        
    
                }else{
                    $e->unit = ($e->unit!=null) ? $e->unit : 1;
                    $unittrim=trim($e->unit);
                    $unit = Unit::where("unit", "like",$unittrim)->get();
    
                    if($unit->isEmpty()){
                        if($boolIsUnitCreate){
                            // $newUnit = Unit::insertGetId(array(
                            //     "unit" => $e->unit,
                            //     "created_at"  => Carbon::now(),
                            //     "updated_at" => Carbon::now()
                            //     ));
                        }else{
                            $newUnit = 0;
                        }
                        
                    }else{
                        $newUnit = $unit->first()->id;
                    }
                    $p = array(
                        "id" => 0, 
                        'category'  =>  $e->category,
                        'barcode'  =>  $e->item_code,  
                        'itemName'  =>  $e->item_name,
                        'itemType'  =>  $e->item_type,
                        'unit'  => $e->unit,
                        'qty'  =>  $e->qty,
                        'costPrice'  =>  $e->cost_price,
                        'salePrice'  => $e->selling_price,
                        'cp_vat'    => $e->cp_vat,
                        'type'  => "new",
                        'conflict'  => $check,
                        'isItemCreate' => 'true',
                        );
    
    
                    $cat = Category::where("parent_category","<>", 0)
                    ->where("categorie", "like", $p["category"])
                    ->get();
    
                    if($cat->isEmpty()){
                        if($boolIsCatCreate){
                            // $newCat = Category::insertGetId(array(
                            //     "categorie" => $p["category"],
                            //     "parent_category" => 1,
                            //     "created_at"  => Carbon::now(),
                            //     "updated_at" => Carbon::now()
                            //     ));
                        }else{
                            $newCat =0;
                        }
                        
                    }else{
                        $newCat = $cat->first()->id;
                    }
    
                    $item_check = Item::where("barcode","=", $p["barcode"])->get();
                 
    
                        if($item_check->isEmpty()){
                            // if($newCat !=0 && $newUnit!=0){
    
                                if($boolIsItemCreate){
    
                                    // $newItem = Item::insertGetId(array(
                                    //     'category' => $newCat,
                                    //     'barcode' => $p["barcode"], 
                                    //     'itemName' => $p["itemName"],
                                    //     'itemType' => $p["itemType"],
                                    //     'costPrice' => $p["costPrice"],
                                    //     'salePrice' => $p["salePrice"],
                                    //     'unit' => $newUnit,
                                    //     'stock' => 0,
                                    //     "created_at"  => Carbon::now(),
                                    //     "updated_at" => Carbon::now(),
                                    //     ));
                                    

                                     // $item = Item::find($newItem);
                                    
                                      $p["type"] ="data";
                                     array_push($addItems, $p);
                                      // $item->save();
                               }
                           // }
                       }else{

                        $newItem = $item_check->first()->id;
                        $p["type"] ="msql_data_seek(result, row_number)";
                        array_push($duplicate, $p);
                    }
                
            }
        }
    }

    // $response["status"] = "success";
    
    if(count($duplicate)==0){
        $res = array(
            "status"  => "success",
            "msg"   => "Item imported successfully",
            "data"  => $addItems,
            );
    }else{
        $res = array(
            "status"  => "warning",
            "msg"   => "Duplicate Items",
            "data" => $duplicate,
            );
    }
    return response()->json($res, 202);
    }

}	
