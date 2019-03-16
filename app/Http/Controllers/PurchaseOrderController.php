<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Kernel;
use Validator;
use App\PurchaseOrder;
use App\Supplier;
use App\PurchaseOrderItems;

class PurchaseOrderController extends Controller
{
    public function index()
    {
    	 $purchase_order = PurchaseOrder::with(['purchaseOrderItems.item.category','purchaseOrderItems.item.unit','supplier'])->get();
 		 return response()->json($purchase_order, 200);
    }

    public function filter(Request $request)
    {
        if($request->input('searchkey') !=null ){
        $purchase_order = PurchaseOrder::with(['purchaseOrderItems','supplier'])
        ->select('purchase_order.*')
        ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('supplierId','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('purchase_order_date','LIKE','%'.$request->input('searchkey').'%')
                 ->orWhere('status','LIKE','%'.$request->input('searchkey').'%')
                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('ordersPerPage'));
         } else{
            $purchase_order = PurchaseOrder::with(['purchaseOrderItems','supplier'])
            ->select('purchase_order.*')
            ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('ordersPerPage'));
        }
        return response()->json($purchase_order, 200);
    }

    public function show(PurchaseOrder $purchase_order)
    {
        $purchase_order = PurchaseOrder::with(['purchaseOrderItems.item.category','purchaseOrderItems.item.unit','supplier'])
        ->where('id', $purchase_order->id)->get()->first();
        return response()->json($purchase_order, 200);
    }

    public function store(Request $request)
        {
             $duplicate = false;
             $Obj = $request->all();
             $response = array();

            $validator = Validator::make($Obj, [
                'purchase_order_date' => 'required',
                'supplierId'=> 'required',
            ]);

            if($validator->fails()){
                return $this->respondWithError($validator->errors());   
            }

            $response["status"] ="success";
            $purchase_order = PurchaseOrder::create($request->all());
            $poitems = $request->all();
            if(count($poitems["purchase_order_item"])!=0){
                for($i=0; $i<(count($poitems["purchase_order_item"])); $i++)
                {
                    $poitems["purchase_order_item"][$i]["purchase_order_id"]=$purchase_order->id;
                    PurchaseOrderItems::create($poitems["purchase_order_item"][$i]);
                }
            }

            return response()->json($response, 201);
    
        }

        public function update(Request $request,PurchaseOrder $purchase_order)
        {

            $duplicate = false;
            $inputData = $purchase_order;
            $response = array();
            $Obj = $request->all();
            $validator = Validator::make($Obj,[
                'purchase_order_date' => 'required',
                'supplierId' => 'required',
            ]);

            if($validator->fails())
            {
                return $this->respondWithError($validator->errors()); 
            }

            if(count($Obj["purchase_order_item"]) >= 1)
            {
                for($i=0;$i<count($Obj["purchase_order_item"]);$i++)
                {
                    if($Obj["purchase_order_item"][$i]["id"]!="")
                    {
                        $updatePOI = PurchaseOrderItems::find($Obj["purchase_order_item"][$i]["id"]);
                        if($Obj["purchase_order_item"][$i]["deleted"] == false)
                        {
                            $updatePOI->itemId = $Obj["purchase_order_item"][$i]["itemId"];
                            $updatePOI->quantity = $Obj["purchase_order_item"][$i]["quantity"];
                            $updatePOI->save();
                        }else {
                            $updatePOI->delete();
                        }
                    }
                    else{
                        $Obj["purchase_order_item"][$i]["purchase_order_id"]=$purchase_order->id;
                    PurchaseOrderItems::create($Obj["purchase_order_item"][$i]);
                    }
                }
            }
             $response["status"] ="success";
             $Obj["status"]="Pending";
            $purchase_order->update($Obj);
            return response()->json($response,200);
        }

        public function delete($id)
        {
            $purchase_order = PurchaseOrder::with(['purchaseOrderItems'])->find($id);
            if(count($purchase_order['purchaseOrderItems']) >=1)
            {
                for($i=0;$i<count($purchase_order['purchaseOrderItems']);$i++)
                {
                    if($purchase_order['purchaseOrderItems'][$i]['id'] !="")
                    {
                        $deletePurchaseOrder=PurchaseOrderItems::find($purchase_order['purchaseOrderItems'][$i]['id']);
                        $d = $deletePurchaseOrder->delete();
                    }
                }
            }

            $purchase_order->delete();
            return response()->json(null, 204);

        }

}