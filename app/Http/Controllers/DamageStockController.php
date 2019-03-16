<?php

namespace App\Http\Controllers;
use App\Item;
use App\DamageStock;
use App\DamageStockItem;
use App\User;
use App\Stock;
use Illuminate\Support\Facades\Auth;
use App\ExpiryItems;
use App\Purchase;
use App\Audit;
use App\PurchaseReturn;
use DB;

use Illuminate\Http\Request;

class DamageStockController extends Controller
{
     public function index(){
    $damageOrders = DamageStock::with('users')->get();

      return response()->json($damageOrders, 200);
     }
     public function damagStockPaginate(Request $request)
     {
        if($request->input('searchkey') !=null ){
            $searchstring = $request->input('searchkey');
            $damageOrders = DamageStock::with("users")
            ->select('damage_stocks.*')
            ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                    ->orWhere('slip_date','LIKE','%'.$request->input('searchkey').'%')
                    ->orWhere('approx_value_of_cp','LIKE','%'.$request->input('searchkey').'%')
                     ->orWhere('approx_value_of','LIKE','%'.$request->input('searchkey').'%')
                      ->orWhere('type','LIKE','%'.$request->input('searchkey').'%')
                      ->orWhereHas('users', function($q) use ($searchstring) { 
                        $q->Where('username', 'LIKE', '%'.$searchstring.'%');
                      })
                    ->orderBy($request->input('sort'), $request->input('direction'))
                    ->paginate($request->input('itemsPerPage'));
             } else{
                $damageOrders = DamageStock::with("users")->select('damage_stocks.*')
                ->orderBy($request->input('sort'), $request->input('direction'))
                    ->paginate($request->input('itemsPerPage'));
            }
            return response()->json($damageOrders, 200);
    //    $damageOrders = DamageStock::with('users')->paginate(10);
    //   return response()->json($damageOrders, 200);
     }

    //   store new Expiry and Damage item/ product
    public function store(Request $request){

        $type = 0;

        $inputData = $request->all();
        $type = $inputData['type'];

        if($type == 0){

            $orderInsert = DamageStock::create($inputData);

            for($i = 0; $i < sizeof($inputData["itemList"]); $i++){

                $item = Item::find($inputData["itemList"][$i]["item_id"]);
                $item->stock = $item->stock - $inputData["itemList"][$i]["quantity"];
                $item->save();

                $damageItem = DamageStockItem::create(array(
                    "damage_order_id" => $orderInsert["id"],
                    "item_id" => $inputData["itemList"][$i]["item_id"],
                    "quantity" => $inputData["itemList"][$i]["quantity"],
                    "rate" => $inputData["itemList"][$i]["rate"],
                    "amt" => $inputData["itemList"][$i]["amt"],
                    "remark" => $inputData["itemList"][$i]["remark"],
                    ));

                Stock::create(array(
                    "item_id" => $inputData["itemList"][$i]["item_id"], 
                    "type" => 5, 
                    "type_id" => $orderInsert["id"], 
                    "stock" => $item->stock, 
                    "date"  =>$orderInsert["slip_date"]                        
                    ));

            }
            $response["status"] ="success";
            $response["message"] = trans("validation.success_store",["attribute" => trans('glob.damage_stock') ]);
            $response["data"] = $orderInsert;
            return Response($response, 200);

        }else if($type == 1){
            $orderInsert = DamageStock::create($inputData);

            for($i = 0; $i < sizeof($inputData["itemList"]); $i++){

                $item = Item::find($inputData["itemList"][$i]["item_id"]);
                $item->stock = $item->stock - $inputData["itemList"][$i]["quantity"];
                $item->save();

                $expiryItem = ExpiryItems::create(array(
                    "expiry_order_id" => $orderInsert["id"],
                    "mrn_no"  => $inputData["itemList"][$i]["mrn_no"],
                    "item_id" => $inputData["itemList"][$i]["item_id"],
                    "quantity" => $inputData["itemList"][$i]["quantity"],
                    "rate" => $inputData["itemList"][$i]["rate"],
                    "amt" => $inputData["itemList"][$i]["amt"],
                    "remark" => $inputData["itemList"][$i]["remark"],
                    ));


                Stock::create(array(
                    "item_id" => $inputData["itemList"][$i]["item_id"], 
                    "type" => 10, 
                    "type_id" => $orderInsert["id"], 
                    "stock" => $item->stock, 
                    "date"  =>$orderInsert["slip_date"]                        
                    ));

            }
            $response["status"] ="success";
            $response["message"] = trans("validation.success_store",["attribute" => trans('glob.expiry_stock') ]);
            $response["data"] = $orderInsert;
            return Response($response, 200);
        }  
    }
    public function edit($id){
       // $items = Item::all();
        $editDamageStock = DamageStock::with(["damageItemList", 'damageItemList.items','expiryItemList.items'])->find($id);
            return response()->json($editDamageStock, 200);
    }

     public function update(Request $request, $id){

        /** check user auth */
        if (Auth::check()){
            $userId = \Auth::id();
        }else{
            $userId=0;
        }

        $inputData = $request->all();

        $damageUpdate = DamageStock::find($id);


        if($damageUpdate->type == 0 && $damageUpdate->type == $inputData['type'] ){

            $existing = DamageStockItem::where("damage_order_id","=",$id)->get();  

            if(!is_null($damageUpdate)){

                /*\DB::table('damage_stock_items')->where('damage_order_id', '=', $inputData["id"])->delete();*/

                $this->deleteItem($existing,$inputData,$id,0);  

                $damageUpdate->fill($request->all())->save();

                for($i = 0; $i < sizeof($inputData["itemList"]); $i++){

                    $damageItems_ = DamageStockItem::where("damage_order_id","=",$damageUpdate["id"])
                    ->where("item_id","=", $inputData["itemList"][$i]["item_id"]);

                    $expiredItem = $damageItems_->get();



                    if(!is_null($expiredItem)){
                        $prevQty = $expiredItem->first()["quantity"];
                        $damageItems_->delete();
                    }
                    else{
                        $prevQty = 0;
                    }


                    $item = Item::find($inputData["itemList"][$i]["item_id"]);
                    $item->stock = $item->stock + $prevQty - $inputData["itemList"][$i]["quantity"];
                    $item->save();

                    $damageItem = DamageStockItem::create(array(
                        "damage_order_id" => $damageUpdate["id"],
                        "item_id" => $inputData["itemList"][$i]["item_id"],
                        "quantity" => $inputData["itemList"][$i]["quantity"],
                        "rate" => $inputData["itemList"][$i]["rate"],
                        "amt" => $inputData["itemList"][$i]["amt"],
                        "remark" => $inputData["itemList"][$i]["remark"],
                        ));

                    if($prevQty != $inputData["itemList"][$i]["quantity"]){

                        $stock_ = Stock::where("type_id","=",$damageUpdate["id"])
                        ->where("item_id","=", $inputData["itemList"][$i]["item_id"])
                        ->where("type","=", 5);
                        $stockDetails = $stock_->get();

                        if(!$stockDetails->isEmpty()){
                            $stock_->update(['stock' => $item->stock]); 
                        }else{

                            Stock::create(array(
                                "item_id" =>$inputData["itemList"][$i]["item_id"], 
                                "type" => 5, 
                                "type_id" => $damageUpdate["id"], 
                                "stock" => $item->stock, 
                                "date"  => $damageUpdate["slip_date"]                       
                                ));

                        }
                    }
                }

                /** save audit for the damage with type id 6 @date->12-07-2017*/
                $auditSave = Audit::create(array(
                    "record_id" => $id,
                    "type" =>  6,
                    "remark" =>  $inputData['updateremark'],
                    "user_id" => $userId,
                    ));

                $response["status"] ="success";
                $response["message"] = trans("validation.success_update",[ "attribute" => trans('glob.damage_stock') ]);
                return Response($response, 200);  

            }

        }else if($damageUpdate->type == 1 && $damageUpdate->type == $inputData['type']){
            $existing = ExpiryItems::where("expiry_order_id","=",$id)->get();  

            if(!is_null($damageUpdate)){

                $this->deleteItem($existing,$inputData,$id,1);  

                $damageUpdate->fill($request->all())->save();

                for($i = 0; $i < sizeof($inputData["itemList"]); $i++){

                    $damageItems_ = ExpiryItems::where("expiry_order_id","=",$damageUpdate["id"])
                    ->where("item_id","=", $inputData["itemList"][$i]["item_id"]);

                    $expiredItem = $damageItems_->get();

                    if(!is_null($expiredItem)){
                        $prevQty = $expiredItem->first()["quantity"];
                        $damageItems_->delete();
                    }
                    else{
                        $prevQty = 0;
                    }


                    $item = Item::find($inputData["itemList"][$i]["item_id"]);
                    $item->stock = $item->stock + $prevQty - $inputData["itemList"][$i]["quantity"];
                    $item->save();

                    $damageItem = ExpiryItems::create(array(
                        "expiry_order_id" => $damageUpdate["id"],
                        "mrn_no"  => $inputData["itemList"][$i]["mrn_no"],
                        "item_id" => $inputData["itemList"][$i]["item_id"],
                        "quantity" => $inputData["itemList"][$i]["quantity"],
                        "rate" => $inputData["itemList"][$i]["rate"],
                        "amt" => $inputData["itemList"][$i]["amt"],
                        "remark" => $inputData["itemList"][$i]["remark"],
                        ));

                    if($prevQty != $inputData["itemList"][$i]["quantity"]){

                        $stock_ = Stock::where("type_id","=",$damageUpdate["id"])
                        ->where("item_id","=", $inputData["itemList"][$i]["item_id"])
                        ->where("type","=", 10);
                        $stockDetails = $stock_->get();

                        if(!$stockDetails->isEmpty()){
                            $stock_->update(['stock' => $item->stock]); 
                        }else{

                            Stock::create(array(
                                "item_id" =>$inputData["itemList"][$i]["item_id"], 
                                "type" => 10, 
                                "type_id" => $damageUpdate["id"], 
                                "stock" => $item->stock, 
                                "date"  => $damageUpdate["slip_date"]                       
                                ));
                        }
                    }
                }


                /** save audit for the expiry with type id 5 @date->12-07-2017*/
                $auditSave = Audit::create(array(
                   "record_id" => $id,
                   "type" =>  5,
                   "remark" =>  $inputData['updateremark'],
                   "user_id" => $userId,
                   ));

                $response["status"] ="success";
                $response["message"] = trans("validation.success_update",[ "attribute" => trans('glob.expiry_stock') ]);
                return Response($response, 200);  

            }
        }else if( $damageUpdate->type != $inputData['type']){
            /** delete existing bill and create new because you change damage to expiry or expiry to damage */
            $this->destroyExisting($id);
            $damageUpdate->fill($request->all())->save();

            $this->createNewBill($id,$inputData);

            $response["status"] ="success";
            if($damageUpdate->type == 0){
                $resourceAlert = trans('glob.damage_stock');
            }else if($damageUpdate->type == 1){
             $resourceAlert = trans('glob.expiry_stock');
         }
         $response["message"] = trans("validation.success_update",[ "attribute" => $resourceAlert ]);
         return Response($response, 200); 

     }else{
        $response["status"] ="error";
        toastr::warning('Warning', trans("validation.warning_update_deleted_item",["attribute" => trans('glob.damage_stock') ]));
        return Response($response, 200);
    }


}
/** create new item and stock for new type  damage/expiry after type update */
public function createNewBill($id,$inputData){

    $orderInsert = DamageStock::find($id);

    if($orderInsert->type == 0){

        for($i = 0; $i < sizeof($inputData["itemList"]); $i++){

            $item = Item::find($inputData["itemList"][$i]["item_id"]);
            $item->stock = $item->stock - $inputData["itemList"][$i]["quantity"];
            $item->save();

            $damageItem = DamageStockItem::create(array(
                "damage_order_id" => $orderInsert["id"],
                "item_id" => $inputData["itemList"][$i]["item_id"],
                "quantity" => $inputData["itemList"][$i]["quantity"],
                "rate" => $inputData["itemList"][$i]["rate"],
                "amt" => $inputData["itemList"][$i]["amt"],
                "remark" => $inputData["itemList"][$i]["remark"],
                ));

            Stock::create(array(
                "item_id" => $inputData["itemList"][$i]["item_id"], 
                "type" => 5, 
                "type_id" => $orderInsert["id"], 
                "stock" => $item->stock, 
                "date"  =>$orderInsert["slip_date"]                        
                ));

        }
    }else if($orderInsert->type == 1){
        for($i = 0; $i < sizeof($inputData["itemList"]); $i++){

            $item = Item::find($inputData["itemList"][$i]["item_id"]);
            $item->stock = $item->stock - $inputData["itemList"][$i]["quantity"];
            $item->save();

            $expiryItem = ExpiryItems::create(array(
                "expiry_order_id" => $orderInsert["id"],
                "mrn_no"  => $inputData["itemList"][$i]["mrn_no"],
                "item_id" => $inputData["itemList"][$i]["item_id"],
                "quantity" => $inputData["itemList"][$i]["quantity"],
                "rate" => $inputData["itemList"][$i]["rate"],
                "amt" => $inputData["itemList"][$i]["amt"],
                "remark" => $inputData["itemList"][$i]["remark"],
                ));


            Stock::create(array(
                "item_id" => $inputData["itemList"][$i]["item_id"], 
                "type" => 10, 
                "type_id" => $orderInsert["id"], 
                "stock" => $item->stock, 
                "date"  =>$orderInsert["slip_date"]                        
                ));
        }
    }
    return;
}
public function deleteItem($existing,$inputData,$id, $type){
        if($type == 0){
            foreach ($existing as $existing_item) {
                $flag ='false';
                foreach ($inputData["itemList"] as $p) {

                    if($existing_item->item_id == $p["item_id"]){               
                        $flag ='true';
                    }            
                }        

                if($flag == 'false'){         
                    $deleteItem = DamageStockItem::where("damage_order_id","=",$id)
                    ->where("item_id","=", $existing_item->item_id)
                    ->delete();
                    $item = Item::find($existing_item->item_id);
                    $item->stock = $item->stock + $existing_item->quantity;
                    $item->save();

                    $deleteStock = Stock::where("type_id","=",$id)
                    ->where("type","=", 5)
                    ->where("item_id","=", $existing_item->item_id)
                    ->delete();
                } 
            } 
        }else if($type == 1){
            foreach ($existing as $existing_item) {
                $flag ='false';
                foreach ($inputData["itemList"] as $p) {

                    if($existing_item->item_id == $p["item_id"]){               
                        $flag ='true';
                    }            
                }        

                if($flag == 'false'){         
                    $deleteItem = ExpiryItems::where("expiry_order_id","=",$id)
                    ->where("item_id","=", $existing_item->item_id)
                    ->delete();
                    $item = Item::find($existing_item->item_id);
                    $item->stock = $item->stock + $existing_item->quantity;
                    $item->save();

                    $deleteStock = Stock::where("type_id","=",$id)
                    ->where("type","=", 10)
                    ->where("item_id","=", $existing_item->item_id)
                    ->delete();
                } 
            } 
        }

    }
 public function getItemsByMRN(Request $request, $id){
   
   // $getpurchase = Purchase::with(['purchasedItems', 'purchasedItems.item'])->where('mrn_date', '<=', '2018-03-06')->find($id);
        $getpurchase = Purchase::with(['purchasedItems', 'purchasedItems.item'])->find($id);
        // return Response()->json($getpurchase,200);
        $arritems = array();

        if(count($getpurchase)){

            foreach ($getpurchase['purchasedItems'] as  $getitems) {

               // $returnItemQty=DB::select("SELECT IFNULL(SUM(pri.qty), 0) AS qtyReturn FROM purchases AS p LEFT JOIN ( purchase_returns AS pr JOIN purchase_return_items AS pri ON pr.id = pri.purchase_return_id ) ON p.supplier_id = pr.supplier_id AND p.supplierBillNo = pr.supplier_billno WHERE p.supplier_id = '".$getpurchase->supplier_id."' AND p.supplierBillNo = '".$getpurchase->supplierBillNo."' AND pri.item_id = '".$getitems['item_id']."'");
                $expiryItemQty=DB::select("SELECT IFNULL(SUM(ei.quantity), 0) AS qtyExpiry FROM purchases AS p LEFT JOIN expiry_items AS ei ON p.id = ei.mrn_no WHERE p.id = '".$getpurchase->id."' AND ei.item_id = '".$getitems['itemId']."'");
               // $getitems['item']['stock'] =  $getitems['qty'] - ($returnItemQty[0]->qtyReturn + $expiryItemQty[0]->qtyExpiry);
               $getitems['item']['stock'] =  $getitems['quantity'] - ($expiryItemQty[0]->qtyExpiry);

               
                array_push($arritems, $getitems['item']);
            }

            $response["status"] ="success";
            $response["getpurchase"] = $getpurchase;
            $response["items"] = $arritems;
            return Response()->json($response,200);
        }
        else{
            $response["status"] ="error";
            $response["getpurchase"] = [];
            $response["items"] = [];
            return Response()->json($response,200);
        }

    } 
    public function delete($id)
    {
        $damageStock = DamageStock::find($id);

        if($damageStock->type == 0){

            $damageStockItem = DamageStockItem::where('damage_order_id', '=', $id)->get();
            
            foreach ($damageStockItem as $p) {           
                $item = Item::find($p->item_id);
                $item->stock = $item->stock + $p->quantity;
                $item->save();        
                $deleteItem = Stock::where("type_id","=",$id)
                ->where("type","=", 5)
                ->where("item_id","=", $p->item_id)
                ->delete();

            }
            
            DamageStockItem::where('damage_order_id', '=', $id)->delete();
            $damageStock->delete();
            $response["status"] ="success";
            $response["message"] =trans("validation.success_delete",["attribute" => trans('glob.damage_stock') ]);
            

        }else if($damageStock->type == 1){

            $damageStockItem = ExpiryItems::where('expiry_order_id', '=', $id)->get();
            foreach ($damageStockItem as $p) {           
                $item = Item::find($p->item_id);
                $item->stock = $item->stock + $p->quantity;
                $item->save();        
                $deleteItem = Stock::where("type_id","=",$id)
                ->where("type","=", 10)
                ->where("item_id","=", $p->item_id)
                ->delete();

            }

            ExpiryItems::where('expiry_order_id', '=', $id)->delete();
            $damageStock->delete();
            $response["status"] ="success";
            $response["message"] =trans("validation.success_delete",["attribute" => trans('glob.expiry_stock') ]);

        }
        return Response($response,200);
    }
}
