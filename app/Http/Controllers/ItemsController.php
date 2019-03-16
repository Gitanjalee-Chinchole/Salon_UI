<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Item;
use App\Category;
use App\Unit;
use App\ItemIngredient;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Excel;
use App\OpeningStock;
use App\EmployeeServiceCommission;
use App\PackageService;

class ItemsController extends Controller
{
    public function index(Request $request,$itemsPerPage)
    {
        // $items = Item::with(['unit','category','ingredients'])->paginate($itemsPerPage);
        // return response()->json($items, 200);
        $sortDir = $request->input('direction');
        $sortOn = $request->input('sort');
        if($request->input('searchkey') !=null ){
                $search = $request->input('searchkey');
                $items = Item::with(["unit"=>function($query) use($sortOn){
                    if($sortOn === "unit")
                    {
                    $query->orderBy('unit',$sortDir);
                    }
                  },"ingredients","category"])
                ->select('items.*')
                //->orWhere('categories.categorie','LIKE','%'.$search.'%')
                 ->orWhereHas('category', function($q) use ($search) { 
                                    $q->where('categorie', 'like', '%'.$search.'%');
                                  })
                ->orWhereHas('unit', function($q) use ($search) { 
                                    $q->where('unit', 'like', '%'.$search.'%');
                                  })
                ->orWhere('id','LIKE','%'.$search.'%')                 
                ->orWhere('itemName','LIKE','%'.$search.'%')
                ->orWhere('barcode','LIKE','%'.$search.'%')
                ->orWhere('costPrice','LIKE','%'.$search.'%')
                ->orWhere('salePrice','LIKE','%'.$search.'%')
                ->orWhere('min','LIKE','%'.$search.'%')
                ->orWhere('max','LIKE','%'.$search.'%')
                ->orWhere('stock','LIKE','%'.$search.'%')    

                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('itemsPerPage'));
            }else{
                 $items = Item::with(["unit","category","ingredients"])->select('items.*')
                 ->orderBy($request->input('sort'), $request->input('direction'))
                 ->paginate($request->input('itemsPerPage'));
            }
            return response()->json($items, 200);
    }

    
    public function search(Request $request)
    {
     
            $items = Item::with(['unit','category'])->select('items.*')
             ->orWhere($request->input('on'),'LIKE','%'.$request->input('searchkey').'%')->get();
            
      
        return response()->json($items, 200);
    }
     public function searchItemName(Request $request)
    {
        $type = $request->input('type');
            $items = Item::select('items.*')->where('itemType', '=', $type)
             ->Where($request->input('on'),'LIKE','%'.$request->input('searchkey').'%')->get();
        return response()->json($items, 200);
    }

    public function exportToXls(){
        $data = Item::all();    
        if(sizeof($data)){ 
          $carbon = Carbon::today();
          $timestamp = $carbon->timestamp;
          $format = $carbon->format('Y-m-d');
          $exportName = 'Items'.$format; 
          return response()->json(
          Excel::create($exportName, function ($excel) {

            $excel->sheet('Item', function ($sheet) {
                $dataList = Item::get();  
                $itemList = array();
                foreach ($dataList as $o) {
                  
                  array_push($itemList, array(
                   trans('glob.id')  => $o->id,
                   trans('glob.itemName')  => $o->itemName,
                   
                   )
                  );
              }

        // setting column names for data - you can of course set it manually
        $sheet->appendRow(array_keys($itemList[0])); // column names

        
        // getting last row number (the one we already filled and setting it to bold
        $sheet->row($sheet->getHighestRow(), function ($row) {
            $row->setFontWeight('bold');
        });

        // putting users data as next rows
        foreach ($itemList as $user) {
            $sheet->appendRow($user);
        }
    });

        })->download('xlsx'),200);


         // return response()->json(['status' => 'downloded'], 200);

      }
}
    public function uploadImage(Request $request)
    {
        if ($request->hasFile('photo')) {
            $file = $request->photo;
            $imageName=$request->file('photo')->getClientOriginalName();
            $path = $request->photo->storeAs('images',$imageName, 'public_uploads');
            $url = Storage::url($path);
        }
        return response()->json('uploads/images/'.$imageName,200); 
    }

    public function importItems(Request $request)
    {
       //  $file = $request->file('import_items');
       //  $excelFileName=$request->file('import_items')->getClientOriginalName();
       //  $request->import_items->storeAs('import',$excelFileName, 'public_uploads');
        // $file->move(public_uploads().'/import', $excelFileName);

        ini_set("max_execution_time",6000);
        $i=0;
        $file = $request->file('import_items');
        $name = $file->getClientOriginalName();
        $items = array();
        $importedItems = $items;
        $duplicate = array();
        
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
               
                if($e->item_code!=''){
                    $it = Item::with(["category"])->where("barcode", "=", $e->item_code)->get();
                    if(!$it->isEmpty() && $it[0]->category["categorie"] == $e->category){
                        $it->stock = 0;
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
                            'unit'  =>  $it_first->units->unit,  
                            'qty'  =>  $e->qty,
                            'costPrice'  =>  $e->cost_price,
                            'salePrice'  => $e->selling_price,
                            'sp_vat'  => $e->sp_vat, 
                            'cp_vat'  => $e->cp_vat,  
                            'type'  => "old",
                            'conflict'  => $check,
                            'isItemCreate' => 'true',
                            );
                        $item = Item::find($p["id"]);
        
                        // if(! is_null($item)){
        
                        //     if($boolIsItemUpdate){
                        //         $newOpenStock = OpeningStock::create(array(
                        //             'open_stock_date' => Carbon::today(),
                        //             'itemId' => $item->id, 
                        //             'openingStock' => $p["qty"],
                        //             'unit' => $item->unit,
                        //             "created_at"  => Carbon::now(),
                        //             "updated_at" => Carbon::now()
                        //             ));
        
                        //         $item->stock = $item->stock + $newOpenStock["openingStock"];
                        //         $item->save();
        
                        //         $stock = Stock::create(array(
                        //             "item_id" => $item->id, 
                        //             "type" => 1, 
                        //             "type_id" => $newOpenStock['id'], 
                        //             "stock" => $item->stock, 
                        //             "date"  =>$newOpenStock["open_stock_date"]                       
                        //             ));
                        //     }
                        // }
        
                    }else{
                        $e->unit = ($e->unit!=null) ? $e->unit : 1;
                        $p = array(
                            "id" => 0, 
                            'category'  =>  $e->category,
                            'barcode'  =>  $e->item_code,  
                            'itemName'  =>  $e->item_name,
                            'itemType'  =>  $e->item_type,
                            'unit'  =>($e->unit!=null) ? $e->unit : 1, 
                            'qty'  =>  $e->qty,
                            'costPrice'  =>  $e->cost_price,
                            'salePrice'  => $e->selling_price,
                            'sp_vat'  => $e->sp_vat, 
                            'cp_vat'  => $e->cp_vat,  
                            'type'  => "new",
                            'conflict'  => $check,
                            'isItemCreate' => 'true',
                            );
        
        
                        $cat = Category::where("parent_category","<>", 0)
                        ->where("categorie", "like", $p["category"])
                        ->get();
        
                        if($cat->isEmpty()){
                          
                                $newCat = Category::insertGetId(array(
                                    "categorie" => $p["category"],
                                    "parent_category" => 1,
                                    "created_at"  => Carbon::now(),
                                    "updated_at" => Carbon::now()
                                    ));
                           
                        }else{
                            $newCat = $cat->first()->id;
                        }
        
                        $unit = Unit::where("unit", "like", $p["unit"])->get();
        
                        if($unit->isEmpty()){
                           
                                $newUnit = Unit::insertGetId(array(
                                    "unit" => $p["unit"],
                                    "created_at"  => Carbon::now(),
                                    "updated_at" => Carbon::now()
                                    ));
                           
                        }else{
                            $newUnit = $unit->first()->id;
                        }
        
                        $item_check = Item::where("barcode","=", $p["barcode"])->get();
        
                        if($item_check->isEmpty()){
                            if($newCat !=0 && $newUnit!=0){
        
                            
                                    $newItem = Item::insertGetId(array(
                                        'category' => $newCat,
                                        'barcode' => $p["barcode"], 
                                        'itemName' => $p["itemName"],
                                        'itemType'  => $p["itemType"],
                                        'costPrice' => $p["costPrice"],
                                        'salePrice' => $p["salePrice"],
                                        'sp_vat'  => $p["sp_vat"], 
                                        'cp_vat'  => $p["cp_vat"], 
                                        'unit' => $newUnit,
                                        'stock' => 0,
                                        ));
        
                                    // $newOpenStock = OpeningStock::create(array(
                                    //     'open_stock_date' => Carbon::today(),
                                    //     'itemId' => $newItem, 
                                    //     'openingStock' => $p["qty"],
                                    //     'unit' => $newUnit,
                                    //     "created_at"  => Carbon::now(),
                                    //     "updated_at" => Carbon::now()
                                    //     ));
        
        
                                    $item = Item::find($newItem);
        
                                   // $item->stock = $item->stock + $newOpenStock["openingStock"];
                                    $item->save();
        
                                    // $openStock = Stock::create(array(
                                    //     "item_id" => $newItem, 
                                    //     "type" => 1, 
                                    //     "type_id" => $newOpenStock['id'], 
                                    //     "stock" => $item->stock, 
                                    //     "date"  =>$newOpenStock["open_stock_date"]                       
                                    //     ));
                                
        
                            }
                            
                        }else{
                            $newItem = $item_check->first()->id;
                            $p["type"] ="duplicate";
                            array_push($duplicate, $p);
                        }
                    }
                }
            }

            if(count($duplicate)==0){
                $res = array(
                    "status"  => "success",
                    "msg"   => trans("validation.success_store",[ "attribute" => trans('glob.item') ]),
                    );
            }else{
                $res = array(
                    "status"  => "warning",
                    "msg"   => trans("validation.success_store",[ "attribute" => trans('glob.item') ]),
                    "duplicate" => $duplicate,
                    );
            }

         return response()->json($res, 200);
    }


function saveitems(Request $request){
    $importedItems = $request->all();
    $duplicate = array();

    if(!is_null($importedItems)){

        foreach ($importedItems as $p) { 

            $p = (Array)$p;
            $p["category"] = (isset($p["category"])) ? $p["category"] : '';
            $p["unit"] = (isset($p["unit"])) ? $p["unit"] : '';
            $p["itemType"] = (isset($p["itemType"])) ? $p["itemType"] : '';
            $p["barcode"] = (isset($p["barcode"])) ? $p["barcode"] : '';
            $p["itemName"] = (isset($p["itemName"])) ? $p["itemName"] : '';
            $p["salePrice"] = (isset($p["salePrice"])) ? $p["salePrice"] : 0;
            $p["costPrice"] = (isset($p["costPrice"])) ? $p["costPrice"] : 0;
            $p["quantity"] = (isset($p["quantity"])) ? $p["quantity"] : 0;
             $p["sp_vat"] = (isset($p["sp_vat"])) ? $p["sp_vat"] : 0;
             $p["cp_vat"] = (isset($p["cp_vat"])) ? $p["cp_vat"] : 0;
            if($p["sp_vat"] < 0 || $p["sp_vat"]>100){

                $res = array(
                    "status"  => "Error",
                    "msg"   => trans("S.P. VAT between 0 to 100"),
                    "formControlar"  => "sp_vat",
                    );
                    return Response($res,200);
                // if($request->all()){
                //     return Response($res,200);
                // }else{
                //     ($res["status"] == "success") 
                //     ? 
                //     $res["msg"] = success('Success', trans("validation.success_store",[ "attribute" => trans('glob.purchase') ]))
                //     :
                //     $res["msg"] = error('error', trans("validation.import_error",[ "attribute" => trans('glob.purchase') ]));
                //     return Response($res,200);;
                // }
            }

            if($p["cp_vat"] < 0 || $p["cp_vat"]>100){

                $res = array(
                    "status"  => "Error",
                    "msg"   => trans("C.P. VAT between 0 to 100"),
                    "formControlar"  => "cp_vat",
                    );
                    return Response($res,200);
                // if($request->all()){
                //     return Response($res,200);
                // }else{
                //     ($res["status"] == "success") 
                //     ? 
                //     $res["msg"] =success('Success', trans("validation.success_store",[ "attribute" => trans('glob.purchase') ]))
                //     :
                //     $res["msg"] = error('error', trans("validation.import_error",[ "attribute" => trans('glob.purchase') ]));
                //     return Response($res,200);
                // }
            }
            if($p["id"]==0){
                if(!empty($p["category"])){
                $cat = Category::where("parent_category","<>", 0)
                ->where("categorie", "like", $p["category"])
                ->get();

                if($cat->isEmpty()){
                        $newCat = Category::insertGetId(array(
                            "categorie" => $p["category"],
                            "parent_category" => 1,
                            "created_at"  => Carbon::now(),
                            "updated_at" => Carbon::now()
                            ));
                }else{
                    $newCat = $cat->first()->id;
                }
            }
            else{
                $newCat=0;
            }

                $unit = Unit::where("unit", "like", $p["unit"])->get();

                if($unit->isEmpty()){

                        $newUnit = Unit::insertGetId(array(
                            "unit" => $p["unit"],
                            "created_at"  => Carbon::now(),
                            "updated_at" => Carbon::now()
                            ));
                }else{
                    $newUnit = $unit->first()->id;
                }


                $item_check = Item::where("barcode","=", $p["barcode"])->get();
                if($item_check->isEmpty()){

                    if($newCat!=0 && $newUnit!=0){

                            $newItem = Item::create(array(
                                'category' => $newCat,
                                'barcode' => $p["barcode"],
                                'itemType' => $p["itemType"], 
                                'itemName' => $p["itemName"],
                                'costPrice' => $p["costPrice"],
                                'salePrice' => $p["salePrice"],
                                'sp_vat' => $p["sp_vat"],
                                'cp_vat' => $p["cp_vat"],
                                'unit' => $newUnit,
                                'stock' => $p["quantity"],
                                ));
                            
                            // $newOpenStock = OpeningStock::create(array(
                            //     'open_stock_date' => Carbon::today(),
                            //     'itemId' => $newItem['id'], 
                            //     'openingStock' => $p["quantity"],
                            //     'unit' => $newUnit,
                            //     "created_at"  => Carbon::now(),
                            //     "updated_at" => Carbon::now()
                            //     ));
                              
                            // $openStock = Stock::create(array(
                            //     "item_id" => $newItem['id'], 
                            //     "type" => 1, 
                            //     "type_id" => $newOpenStock['id'], 
                            //     "stock" => $p["quantity"], 
                            //     "date"  =>$newOpenStock["open_stock_date"]                       
                            //     ));
                            //  }
                   
                }else{
                    $p["type"] ="duplicate";
                    array_push($duplicate, $p);
                }

            }else{
                // old item code
                $item = $item_check->first();
                if(! is_null($item)){
                        $item->stock = $item->stock + $p["quantity"];
                        $item->costPrice = $p["costPrice"];
                      $item->cp_vat = $p["cp_vat"];
                        $item->salePrice = $p["salePrice"];
                       $item->sp_vat = $p["sp_vat"];
                        $item->save();
                        if($p["quantity"]>0){
                        // $newOpenStock = OpeningStock::create(array(
                        //     'open_stock_date' => Carbon::today(),
                        //     'itemId' => $item->id, 
                        //     'openingStock' => $p["quantity"],
                        //     'unit' => $item->unit,
                        //     "created_at"  => Carbon::now(),
                        //     "updated_at" => Carbon::now()
                        //     ));

                        // $stock = Stock::create(array(
                        //     "item_id" => $item->id, 
                        //     "type" => 1, 
                        //     "type_id" => $newOpenStock['id'], 
                        //     "stock" => $item->stock, 
                        //     "date"  =>$newOpenStock["open_stock_date"]                       
                        //     ));
                    }
                    else{

                        $item->stock = $item->stock;
                        $item->costPrice = $p["costPrice"];
                       $item->cp_vat=$p["cp_vat"];
                        $item->salePrice = $p["salePrice"];
                        $item->sp_vat = $p["sp_vat"];
                        $item->save();

                    }
                

            }
        }
    }
        }
    }
    // if excel is empty
    else 
    {
        $res = array(
            "status"  => "Error",
            "msg"   => trans("validation.error_store",[ "attribute" => trans('glob.item') ]),
            "duplicate" => $duplicate
            );
    
    }

    if(count($duplicate)==0){
        $res = array(
            "status"  => "success",
            "msg"   => trans("validation.success_store",[ "attribute" => trans('glob.item') ]),
            );
    }else{
        $res = array(
            "status"  => "warning",
            "msg"   => trans("validation.success_store",[ "attribute" => trans('glob.item') ]),
            "duplicate" => $duplicate
            );
    }
    return Response($res,200);
}
    public function show(Item $item)
    {
        $item = Item::with(['unit','category','ingredients.ingredientItem'])->where('id',$item->id)->get()->first();
        return $item;
    }

    public function store(Request $request)
    {
        $duplicate = false;
        $inputData = $request->all();
      //  $items = Item::with(['category")->get();
        $response = array();

        $validate = $this->addvalidator($inputData);

        if($validate->fails())
    {
        return $this->respondWithError($validate->errors());
    }
    $inputData['sp_vat'] = $inputData['sp_vat'] == '' ? 0 : $inputData['sp_vat'];
    $inputData['cp_vat'] = $inputData['cp_vat'] == '' ? 0 : $inputData['cp_vat'];
    //     $barcode = Item::where("barcode","=",$inputData["barcode"])->first(); 
    //    if($barcode != null){
    //     $response["status"] ="warning";
    //     $response["message"] ="";
    //     $response["focus"] =[];
    //     array_push($response["focus"] ,"barcode");
    //     $response["data"] = $inputData;
    //     $duplicate = true;
    // }

    // if($duplicate){
    //     return response()->json($response, 200);
    // }
    // else {
        $response["status"] ="success";
        $item = Item::create($inputData);
        $itemData =$request->all();
       if(count($itemData["item_ingredients"])!=0)
       {   
         
         for($i=0;$i<count($itemData["item_ingredients"]);$i++)
         {
           $itemData["item_ingredients"][$i]['item']=$item->id;
             ItemIngredient::create($itemData["item_ingredients"][$i]);
         }
        }

        return response()->json($response, 201);
    
}

    public function update(Request $request, Item $item)
{

    $duplicate = false;
    $inputData = $item;
    $data = $request->all();
  //  $items = Item::with(['category")->get();
    $response = array();
   
    $validate = $this->validator($data);

    if($validate->fails())
    {
        return $this->respondWithError($validate->errors());
    }

    if(count($data["item_ingredients"])>=1)
    {
       // print_r(($data["item_ingredients"][0]));

    for($i=0;$i<count($data["item_ingredients"]);$i++)
    {
        // $match = ItemIngredient::where([
        //     "item","=",$data["item_ingredients"][$i]["item"],
        //     "ingredient","=",$data["item_ingredients"][$i]["ingredient"],
        // ]);
        if($data["item_ingredients"][$i]["id"]!="")
        {
            $updateIngredient =ItemIngredient::find($data["item_ingredients"][$i]["id"]);
            if($data["item_ingredients"][$i]["deleted"]==false)
            {
           
            $updateIngredient->quantity =$data["item_ingredients"][$i]["quantity"];
            $updateIngredient->save();
            }
            else {
                $updateIngredient->delete();
            }
        }
        else {
           
            $data["item_ingredients"][$i]["item"]=$item->id;
            ItemIngredient::create($data["item_ingredients"][$i]);
        }
    }
    }
    $barcode = Item::with('ingredients')->where("barcode","=",$inputData["barcode"])->first(); 
    $data['sp_vat'] = $data['sp_vat'] == '' ? 0 : $data['sp_vat'];
    $data['cp_vat'] = $data['cp_vat'] == '' ? 0 : $data['cp_vat'];
    $response["status"] ="success";
    $response["data"] = $barcode;
    $item->update($data);
//    if($barcode != null && $barcode["id"] != $inputData["id"]){
//     $response["status"] ="warning";
//     $response["message"] ="";
//     $response["focus"] =[];
//     array_push($response["focus"] ,"barcode");
//     $response["data"] = $inputData;
//     $duplicate = true;
// }

// if($duplicate){
//     return response()->json($response, 200);
// }
// else {
//     $response["status"] ="success";
//     $response["data"] = $barcode;
//     $item->update($request->all());
//     return response()->json($response, 201);
// }

 return response()->json($response, 200);

}
    private function validator($data)
    {
        $messages = [
            'serviceTime.date_format' => 'The :attribute field is not in valid format.',
        ];
        return Validator::make($data, [
          'barcode' => 'required|unique:items,barcode,'.$data['id'].'|min:1',
          'serviceTime' => 'nullable|date_format:"H:i"'
        ],$messages);
    }

    private function addvalidator($data)
    {
        $messages = [
            'serviceTime.date_format' => 'The :attribute field is not in valid format.',
        ];
        return Validator::make($data, [
          'barcode' => 'required|unique:items,barcode|min:1',
          'serviceTime' => 'nullable|date_format:"H:i"'
        ],$messages);
    }
     public function delete($id)
    {
        $isOpeningStock = OpeningStock::where("itemId","=",$id)->first();
        $isIngredients = ItemIngredient::where("ingredient","=",$id)->first();
        $isEmployeeCommRate_Service = EmployeeServiceCommission::where("itemId", "=",$id)->first();
        $isPackageService = PackageService::where("itemId", "=",$id)->first();
        if(sizeof($isOpeningStock) == 0 && sizeof($isIngredients) == 0 && sizeof($isEmployeeCommRate_Service) == 0 && sizeof($isPackageService) == 0)
        {
            $data = Item::with(['ingredients'])->find($id);
             if(count($data["ingredients"]) >= 1)
            {
       
                for($i=0;$i<count($data["ingredients"]);$i++)
                {
                     if($data["ingredients"][$i]["id"]!="")
                    {
                        $deleteIngredient =ItemIngredient::find($data["ingredients"][$i]["id"]);
                        $r = $deleteIngredient->delete();
                    }
                }
   
            }
             Item::find($id)->delete();
             $response["status"] ="success";
            $response["message"] =trans("validation.success_delete",["attribute" => trans('glob.item') ]);
        }else{
        $response = array('status' =>  "warning", "data" =>array(),  "message" =>' Item Stock Exists, Cant delete Item!' );
    }
    return Response($response,200);
    }
}
