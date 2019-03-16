<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Kernel;
use Validator;
use App\Supplier;
use App\PurchaseReturnItems;
use App\PurchaseReturn;
use App\Item;
use Carbon\Carbon;
use App\Unit;
use App\Category;

class PurchaseReturnController extends Controller
{
     public function index()
    {
         $purchase_return = PurchaseReturn::with(['purchaseReturnItems.item.category','supplier','purchaseReturnItems.item.unit','employees','purchase.supplier','purchase.purchaseItems'])->get();
         return $purchase_return;
         return response()->json($purchase_return, 200);
    }

    public function filter(Request $request)
    {
        if($request->input('searchkey') !=null ){
        $purchase_return = PurchaseReturn::with(['purchaseReturnItems','employees','supplier','purchase.supplier','purchase.purchaseItems'])
        ->select('purchase_returns.*')
        ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('supplierId','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('supplier_bill_no','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('bill_amount','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('return_date','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('return_through','LIKE','%'.$request->input('searchkey').'%')
                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('purchasesPerPage'));
         } else{
            $purchase_return = PurchaseReturn::with(['purchaseReturnItems','employees','supplier','purchase.supplier','purchase.purchaseItems'])
            ->select('purchase_returns.*')
            ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('purchasesPerPage'));
        }
        return response()->json($purchase_return, 200);
    }

    public function show(PurchaseReturn $purchase_return)
    {
        $purchase_return = PurchaseReturn::with(['purchaseReturnItems.item.category','supplier','purchasereturnItems.item.unit','employees','purchase.supplier','purchase.purchaseItems'])
        ->where('id', $purchase_return->id)->get()->first();
        return response()->json($purchase_return, 200);
    }

    public function store(Request $request)
        {
             $duplicate = false;
             $Obj = $request->all();
             $response = array();

            $validator = Validator::make($Obj, [
                'return_date' => 'required',
                'purchaseId'=> 'required',
                'supplier_bill_no'=> 'required',
                'return_through' => 'required'
            ]);

            if($validator->fails()){
                return $this->respondWithError($validator->errors());   
            }

            $response["status"] ="success";
            $purchase_return = PurchaseReturn::create($request->all());
            $return_items = $request->all();
            if(count($return_items["purchase_return_items"])!=0){
                for($i=0; $i<(count($return_items["purchase_return_items"])); $i++)
                {
                    $id = $return_items["purchase_return_items"][$i]['itemId'];
                    $item = Item::find($id);
                    $item->cp_vat = $return_items['purchase_return_items'][$i]['cp_vat'];
                    $item->stock = $item->stock - $return_items['purchase_return_items'][$i]['quantity'];
                    $item->save();
                    $return_items["purchase_return_items"][$i]["purchaseRId"]=$purchase_return->id;
                    PurchaseReturnItems::create($return_items["purchase_return_items"][$i]);
                }
            }

            return response()->json($response, 201);
        }

        public function update(Request $request,PurchaseOrder $purchase_return)
        {
             $duplicate = false;
             $Obj = $request->all();
             $response = array();

            $validator = Validator::make($Obj, [
                'return_date' => 'required',
                'purchaseId' => 'required',
                'supplier_bill_no'=> 'required',
                'return_through' => 'required'
            ]);

            if($validator->fails()){
                return $this->respondWithError($validator->errors());   
            }

            if(count($Obj["purchase_return_items"]) >= 1)
            {
                for($i = 0; $i < count($Obj["purchase_return_items"]); $i++)
                {
                    if($Obj["purchase_return_items"][$i]['id']!="")
                    {
                        $updatePReturn = PurchaseReturnItems::find($Obj["purchase_return_items"][$i]['id']);
                        if($Obj["purchase_return_items"][$i]["deleted"] == false)
                        {
                            $updatePReturn->quantity = $Obj["purchase_return_items"][$i]["quantity"];
                            $updatePReturn->cp_vat = $Obj["purchase_return_items"][$i]["cp_vat"];
                            $updatePReturn->cp_vat = $Obj["purchase_return_items"][$i]["rate"];
                            $updatePReturn->cp_vat = $Obj["purchase_return_items"][$i]["discount_rate"];
                            $updatePReturn->update();
                        }else {
                            $updatePReturn->delete();
                        }
                    }
                    else{
                        $Obj["purchase_return_items"][$i]["purchaseRId"]=$purchase_return->id;
                    PurchaseReturnItems::create($Obj["purchase_return_items"][$i]);
                    }
                    }
                }
            }

        public function delete($id)
        {
            $purchase_return = PurchaseReturn::with(['purchaseReturnItems'])->find($id);
            if(count($purchase_return['purchaseReturnItems']) >=1)
            {
                for($i=0;$i<count($purchase_return['purchaseReturnItems']);$i++)
                {
                     $item = Item::find($purchase_return['purchase_return_items'][$i]['itemId']);
                     $item->stock = $item->stock - $purchase_return['purchase_return_items'][$i]['quantity'];
                     $item->save(); 
                    if($purchase_return['purchase_return_items'][$i]['id'] !="")
                    {
                      $deletePurchaseReturn=PurchaseOrderItems::find($purchase_return['purchaseReturnItems'][$i]['id']);
                      $d = $deletePurchaseReturn->delete();
                    }
                }
            }

            $purchase_return->delete();
            return response()->json(null, 204);

        }
}
