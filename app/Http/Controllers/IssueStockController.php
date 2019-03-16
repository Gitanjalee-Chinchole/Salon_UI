<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Item;
use App\IssueStock;
use App\IssueStockItem;
use App\Stock;
use DB;

class IssueStockController extends Controller
{
    public function index(){
        $issueOrders = IssueStock::with('employees')->get();
    
          return response()->json($issueOrders, 200);
         }
         public function issueStockPaginate(Request $request)
         {
            if($request->input('searchkey') !=null ){
                $searchstring = $request->input('searchkey');
                $issueOrders = IssueStock::with("employees")
                ->select('issue_stocks.*')
                ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                        ->orWhere('slip_date','LIKE','%'.$request->input('searchkey').'%')
                         ->orWhere('approx_value_of','LIKE','%'.$request->input('searchkey').'%')
                          ->orWhereHas('employees', function($q) use ($searchstring) { 
                            $q->Where('name', 'LIKE', '%'.$searchstring.'%');
                          })
                        ->orderBy($request->input('sort'), $request->input('direction'))
                        ->paginate($request->input('itemsPerPage'));
                 } else{
                    $issueOrders = IssueStock::with("employees")->select('issue_stocks.*')
                    ->orderBy($request->input('sort'), $request->input('direction'))
                        ->paginate($request->input('itemsPerPage'));
                }
                return response()->json($issueOrders, 200);
         }

        //    Store Issue Stock 
         public function store(Request $request){

            $inputData = $request->all();
     
     
            $issueInsert = IssueStock::create($inputData);
     
            for($i = 0; $i < sizeof($inputData["itemList"]); $i++){
     
             $item = Item::find($inputData["itemList"][$i]["item_id"]);
             $item->stock = $item->stock -$inputData["itemList"][$i]["quantity"];
             $item->save();
     
             $issueItem = IssueStockItem::create(array(
                 "issue_stocks_id" => $issueInsert["id"],
                 "item_id" => $inputData["itemList"][$i]["item_id"],
                 "quantity" => $inputData["itemList"][$i]["quantity"],
                 "rate" => $inputData["itemList"][$i]["rate"],
                 "amt" => $inputData["itemList"][$i]["amt"],
                 "remark" => $inputData["itemList"][$i]["remark"],
                 ));
     
             Stock::create(array(
                 "item_id" => $inputData["itemList"][$i]["item_id"], 
                 "type" => 4, 
                 "type_id" => $issueInsert["id"], 
                 "stock" => $item->stock, 
                 "date"  =>$issueInsert["slip_date"]                        
                 )); 
             
     
         }
         $response["status"] ="success";
         $response["message"] = trans("validation.success_store",["attribute" => trans('glob.issue') ]);
         $response["data"] = $issueInsert;
         return Response($response, 200);
     
     }
     public function edit($id){
        //$items = Item::all();
        $editIssueStock = IssueStock::with(["issueItemList", 'issueItemList.items'])->find($id);
        return response()->json($editIssueStock, 200);       
    }

    //  update Issue items stock details
    public function update(Request $request, $id){
        $inputData = $request->all();
        
        $issueInsert = IssueStock::find($id);

        $existing = IssueStockItem::where("issue_stocks_id","=",$id)->get();  

        if(!is_null($issueInsert)){

            /*\DB::table('issue_stock_items')->where('issue_stocks_id', '=', $inputData["id"])->delete();
*/
            $this->deleteItem($existing,$inputData,$id);            

            $issueInsert->fill($request->all())->save();

            for($i = 0; $i < sizeof($inputData["itemList"]); $i++){

                $issueItems_ = IssueStockItem::where("issue_stocks_id","=",$issueInsert["id"])
                ->where("item_id","=", $inputData["itemList"][$i]["item_id"]);

                $issuedItem = $issueItems_->get();

                if(!is_null($issuedItem)){
                    $prevQty = $issuedItem->first()["quantity"];
                    $issueItems_->delete();
                }
                else{
                    $prevQty = 0;
                }


                $item = Item::find($inputData["itemList"][$i]["item_id"]);
                $item->stock = $item->stock + $prevQty - $inputData["itemList"][$i]["quantity"];
                $item->save();

                $issueItem = IssueStockItem::create(array(
                    "issue_stocks_id" => $issueInsert["id"],
                    "item_id" => $inputData["itemList"][$i]["item_id"],
                    "quantity" => $inputData["itemList"][$i]["quantity"],
                    "rate" => $inputData["itemList"][$i]["rate"],
                    "amt" => $inputData["itemList"][$i]["amt"],
                    "remark" => $inputData["itemList"][$i]["remark"],
                    ));
                
                if($prevQty != $inputData["itemList"][$i]["quantity"]){
                    $stock_ = Stock::where("type_id","=",$issueInsert["id"])
                    ->where("item_id","=", $inputData["itemList"][$i]["item_id"]);
                    $stockDetails = $stock_->get();

                    if(!$stockDetails->isEmpty()){
                        $stock_->update(['stock' => $item->stock]); 
                    }else{

                       Stock::create(array(
                        "item_id" =>$inputData["itemList"][$i]["item_id"], 
                        "type" => 4, 
                        "type_id" => $issueInsert["id"], 
                        "stock" => $item->stock, 
                        "date"  => $issueInsert["slip_date"]                       
                        ));

                   }
               }
           }

           $response["status"] ="success";
           $response["message"] = trans("validation.success_update",[ "attribute" => trans('glob.issue') ]);
           return Response($response, 200);  

       }else{
        $response["status"] ="error";
      //  toastr::warning('Warning', trans("validation.warning_update_deleted_item",["attribute" => trans('glob.issue') ]));
        return Response($response, 200); 
    } 
}


    // when update any item delete  that item delete in to issue_stock_item table
    public function deleteItem($existing,$inputData,$id){
     foreach ($existing as $existing_item) {
       $flag ='false';
       foreach ($inputData["itemList"] as $p) {

           if($existing_item->item_id == $p["item_id"])
           {               
            $flag ='true';
        }            
    }        

    if($flag == 'false'){          
        $deleteItem = IssueStockItem::where("issue_stocks_id","=",$id)
        ->where("item_id","=", $existing_item->item_id)
        ->delete();
        $deleteItem = Stock::where("type_id","=",$id)
        ->where("type","=", 4)
        ->where("item_id","=", $existing_item->item_id)
        ->delete(); 
        $item = Item::find($existing_item->item_id);
        $item->stock = $item->stock + $existing_item->quantity;
        $item->save();

    } }     
}

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
   
    public function delete($id){
        $issueStock = IssueStock::find($id)->delete();
        $issueStockItem = IssueStockItem::where('issue_stocks_id', '=', $id)->get();        
        foreach ($issueStockItem as $p) {
            $item = Item::find($p->item_id);
            $item->stock = $item->stock + $p->quantity;
            $item->save();        
            $deleteItem = Stock::where("type_id","=",$id)
            ->where("type","=", 4)
            ->where("item_id","=", $p->item_id)
            ->delete(); 
            //$p->delete();
        }
        IssueStockItem::where('issue_stocks_id', '=', $id)->delete();
        $response["status"] ="success";
       // $response["message"] =trans("validation.success_delete",["attribute" => trans('glob.issue') ]);
      //  $response["data"] = $issueStock;
        return Response($response,200);
    }
}
