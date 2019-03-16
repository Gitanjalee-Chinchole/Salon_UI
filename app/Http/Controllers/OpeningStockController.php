<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\OpeningStock;
use App\Item;
use App\Unit;
use App\Category;
use Carbon\Carbon;

class OpeningStockController extends Controller
{
    public function index()
    {
           return OpeningStock::with(['item','unit'])->get();
    }

    public function edit(OpeningStock $opening_stock)
    {
        $opening_stock = OpeningStock::with(['unit','item.category'])->where('id',$opening_stock->id)->get()->first();
        return $opening_stock;
    }

    public function filter(Request $request)
    {
        $opening_stocks;

        if($request->input('searchkey') !=null ){
            $searchstring = $request->input('searchkey');
            $opening_stocks = OpeningStock::with(['item.category.parentcategory','unit'])->select('opening_stocks.*')
                ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('openingStock','LIKE','%'.$request->input('searchkey').'%')
                ->orWhereHas('item', function($q) use ($searchstring) { 
                    $q->Where('itemName', 'LIKE', '%'.$searchstring.'%');
                  })
                   ->orWhereHas('unit', function($q) use ($searchstring) { 
                    $q->Where('unit', 'LIKE', '%'.$searchstring.'%');
                  })
                  ->orWhereHas('item.category', function($q) use ($searchstring) { 
                    $q->Where('categorie', 'LIKE', '%'.$searchstring.'%');
                  })
                ->orWhere('created_at','LIKE','%'.$request->input('searchkey').'%')
                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('unitsperpage'));
     
        }
        else{
            $opening_stocks = OpeningStock::with(['item.category.parentcategory','unit'])->select('opening_stocks.*')
            ->orderBy($request->input('sort') === null ? 'id' : $request->input('sort') , 
            $request->input('direction') === null ? 'asc' :  $request->input('direction') )
            ->paginate($request->input('unitsperpage'));
        }
        return response()->json($opening_stocks, 200);
    }

    public function update(Request $request, $id){

        $editOpenStock = OpeningStock::find($id);       

        if(!is_null($editOpenStock)){           
            $data = $request->all();  

            $prevQty = $editOpenStock->openingStock; 

            /**
             * delete prev item if item which is in database and which is in request is not matched
             * so delete prev item from stock 
             * and newly added item to stock
             */
            $prevItem = $editOpenStock->itemId;

            if($prevItem!=$data["itemId"]){

                $objPrevItem = Item::find($prevItem);     
                $objPrevItem->stock = $objPrevItem->stock - $prevQty;
                $objPrevItem->save(); 

            
                $objCurrentItem = Item::find($data["itemId"]);     
                $objCurrentItem->stock = $objCurrentItem->stock + $data["openingStock"];
                $objCurrentItem->save(); 
        
            }else{

                $item = Item::find($data["itemId"]);
                $item->stock = $item->stock + $data["openingStock"] - $prevQty;
                
                // if($prevQty != $data["openingStock"]){
                //     $stock_ = Stock::where("type_id","=",$editOpenStock->id)
                //     ->where("item_id","=", $data["itemId"])
                //     ->where("type","=", 1);
                //     $stockDetails = $stock_->get();

                //     if(!$stockDetails->isEmpty()){
                //         $stock_->update(['stock' => $item->stock]); 
                //     }else{
                //         Stock::create(array(
                //             "item_id" => $data["itemId"], 
                //             "type" => 1, 
                //             "type_id" => $editOpenStock->id, 
                //             "stock" => $item->stock, 
                //             "date"  =>$data["open_stock_date"]                       
                //             )); 
                //     }
                // }

                $item->save();           
            }           
            $editOpenStock->fill($request->all())->save();

                return Response([
                    'editOpenStock' => $editOpenStock,
                    'status'    => 'success',
                    'msg'       => trans("validation.success_update",[ "attribute" => trans('glob.opening_stock') ])
                    ],200);
           

        }else{
                return Response(['status'    =>'Warning'],200);       
        }

    }

    public function delete($id)
    {
        $openingStock  = OpeningStock::find($id);
        $item = Item::find($openingStock->itemId);
        $item->stock = $item->stock - $openingStock->openingStock;
        $item->save();
    
        (!is_null($openingStock)) ?  ($r = $openingStock->delete()) : ($r = null);
        
        if($r){
            $res = array('status' =>  "success", "data" =>array(), "message" => trans("validation.success_delete",["attribute" => trans('glob.open_stock') ]));
        }
        else{
            $res = array('status' =>  "error", "data" =>array(), "message" => trans("validation.error_delete",["attribute" => trans('glob.open_stock') ]));
        }

        return response($res, 200);
    }

    public function uploadFile(Request $request){
        ini_set("max_execution_time",6000);
        $i=0;
        $file = $request->file('item_stock_import');
        $name = $file->getClientOriginalName();
        $items = array();
        $importedItems = $items;
        $duplicate = array();
    
        $boolIsCatCreate = true;
    
        $boolIsUnitCreate = true;
    
        $boolIsItemUpdate = true;
    
        $boolIsItemCreate = true;
    
        $boolIsOpeningStockCreate = true;
    
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
                        'qty'  =>  $e->qty,
                        'costPrice'  =>  $e->cost_price,
                        'salePrice'  => $e->selling_price,
                        'type'  => "old",
                        'conflict'  => $check,
                        'isItemCreate' => 'true',
                        );
                    $item = Item::find($p["id"]);
                    $unittrim=trim($p["unit"]);
                    $unit = Unit::where("unit", "like",$unittrim)->get();
    
                    if($unit->isEmpty()){
                        if($boolIsUnitCreate){
                            $newUnit = Unit::insertGetId(array(
                                "unit" => $p["unit"],
                                "created_at"  => Carbon::now(),
                                "updated_at" => Carbon::now()
                                ));
                        }else{
                            $newUnit = 0;
                        }
                        
                    }else{
                        $newUnit = $unit->first()->id;
                    }
    
                    
    
                        if(! is_null($item)){
    
                            if($boolIsItemUpdate){
    
                                if($p["qty"] > 0){
                                    $newOpenStock = OpeningStock::create(array(
                                        'open_stock_date' => Carbon::today(),
                                        'itemId' => $item->id, 
                                        'openingStock' => $p["qty"],
                                        'unitId' =>$newUnit,
                                        "created_at"  => Carbon::now(),
                                        "updated_at" => Carbon::now()
                                        ));
    
                                    $item->stock = $item->stock + $newOpenStock["openingStock"];
                                    $item->costPrice=$p["costPrice"];
                                    $item->salePrice=$p["salePrice"];

                                    $item->unit=$newUnit;
                                    $item->save();
    
                                
    
                                }else{
                                    $item->costPrice=$p["costPrice"];
                                    $item->salePrice=$p["salePrice"];

                                    $item->unit=$newUnit;
                                    $item->save();
                                }
                            }
                        }
                    
    
                }else{
                    $e->unit = ($e->unit!=null) ? $e->unit : 1;
                    $unittrim=trim($e->unit);
                    $unit = Unit::where("unit", "like",$unittrim)->get();
    
                    if($unit->isEmpty()){
                        if($boolIsUnitCreate){
                            $newUnit = Unit::insertGetId(array(
                                "unit" => $e->unit,
                                "created_at"  => Carbon::now(),
                                "updated_at" => Carbon::now()
                                ));
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
                        'type'  => "new",
                        'conflict'  => $check,
                        'isItemCreate' => 'true',
                        );
    
    
                    $cat = Category::where("parent_category","<>", 0)
                    ->where("categorie", "like", $p["category"])
                    ->get();
    
                    if($cat->isEmpty()){
                        if($boolIsCatCreate){
                            $newCat = Category::insertGetId(array(
                                "categorie" => $p["category"],
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
                    /*$unittrim=trim($e->unit);
                    $unit = Unit::where("unit", "like",$unittrim)->get();
    
                    if($unit->isEmpty()){
                        if($boolIsUnitCreate){
                            $newUnit = Unit::insertGetId(array(
                                "unit" =>$e->unit,
                                "created_at"  => Carbon::now(),
                                "updated_at" => Carbon::now()
                                ));
                        }else{
                            $newUnit = 0;
                        }
                        
                    }else{
                        $newUnit = $unit->first()->id;
                    }*/
    
                    $item_check = Item::where("barcode","=", $p["barcode"])->get();
                 
    
                        if($item_check->isEmpty()){
                            if($newCat !=0 && $newUnit!=0){
    
                                if($boolIsItemCreate){
    
                                    $newItem = Item::insertGetId(array(
                                        'category' => $newCat,
                                        'barcode' => $p["barcode"], 
                                        'itemName' => $p["itemName"],
                                        'itemType' => $p["itemType"],
                                        'costPrice' => $p["costPrice"],
                                        'salePrice' => $p["salePrice"],
                                        'unit' => $newUnit,
                                        'stock' => 0,
                                        "created_at"  => Carbon::now(),
                                        "updated_at" => Carbon::now(),
                                        ));
    
                                    if( $p["qty"] > 0){
    
                                       $newOpenStock = OpeningStock::create(array(
                                        'open_stock_date' => Carbon::today(),
                                        'itemId' => $newItem, 
                                        'openingStock' => $p["qty"],
                                        'unitId' => $newUnit,
                                        "created_at"  => Carbon::now(),
                                        "updated_at" => Carbon::now()
                                        ));
    
    
                                       $item = Item::find($newItem);
    
    
                                       $item->stock = $item->stock + $newOpenStock["openingStock"];
    
                                       $item->save();
    
                                
                                   }
                               }
                           }
                       }else{
                        $newItem = $item_check->first()->id;
                        $p["type"] ="duplicate";
                        array_push($duplicate, $p);
                    }
                
            }
        }
    }
    
    $response["status"] = "success";
    
    if(count($duplicate)==0){
        $res = array(
            "status"  => "success",
            "msg"   => "OpeningStock imported successfully",
            );
    }else{
        $res = array(
            "status"  => "warning",
            "msg"   => "Duplicate Items",
            "duplicate" => $duplicate,
            );
    }
    return response()->json($res, 200);
    }


    public function store(Request $request)
    {
        $req =  $request->all();
        $ff = array();
        
         foreach ($req as $openStockData) {
           //  $openStockData['open_stock_date'] = '2018-01-01';
            array_push($ff,$openStockData);
          //  $ff.push($openStockData);
            $openingStock = OpeningStock::create($openStockData);
            $data = $request->all();      

            $item = Item::find($openStockData["itemId"]);
            $item->stock = $item->stock + $openStockData["openingStock"];
            $item->save();
        }

        //     $openingStock = OpeningStock::create($openStockData);   

        //     $data = $request->all();      

        //     $item = Item::find($openStockData["itemId"]);
        //     $item->stock = $item->stock + $openStockData["openingStock"];
        //     $item->save();

       
        // }

        if(!is_null($openingStock)){
            $res = array(
                "status"  => "success",
                "msg"   => "Saved successfully"
                );
        }else{
            $res = array(
                "status"  => "Error",
                "msg"   => "Unable to save"    
                );
        }

        return response()->json($res, 200);
    }
}
