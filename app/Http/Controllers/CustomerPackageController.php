<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Item;
use App\Customer;
use App\Employee;
use App\CustomerPackageDetail;
use App\CustomerPackage;

class CustomerPackageController extends Controller
{
     public function index()
    {
       $custPackage =  Customer::with(['assignPackage'])->get();
           return response()->json($custPackage, 200);
    }
      public function paginatePackageAssign(Request $request) 
    {
         if($request->input('searchkey') !=null ){
              $custPackage =  Customer::with('assignPackage')
          ->select('customers.*')
            ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
            ->orWhere('name','LIKE','%'.$request->input('searchkey').'%')
          ->WhereHas('assignPackage', function($q)
            {
                $q->where('customerId', '!=','');
            })->orderBy($request->input('sort'), $request->input('direction'))
         ->paginate($request->input('itemsPerPage'));
        }
        else{
           $custPackage =  Customer::with('assignPackage')
          ->select('customers.*')
          ->WhereHas('assignPackage', function($q)
            {
                $q->where('customerId', '!=','');
            })->orderBy($request->input('sort'), $request->input('direction'))
         ->paginate($request->input('itemsPerPage'));
        }

        return response()->json($custPackage, 200);
    }
      public function customerById($id)
    {
       $custPackage =  Customer::with(['assignPackage.package.packageServices.packageServiceItem.category.parentCategory', 'assignPackage.stylist', 'assignPackage.customerPkgDetail'])->find($id);
           return response()->json($custPackage, 200);
    }
    public function store(Request $request)
    {
        $req =  $request->all();
        $packageAssign = '';
        $ff = array();
        
         foreach ($req as $packageAssignData) {
            array_push($ff,$packageAssignData);
          //  $ff.push($packageAssignData);
          
            if($packageAssignData["id"] != "") {
                $updatePackageAssign = CustomerPackage::with(['customerPkgDetail'])->find($packageAssignData["id"]);
                // return response()->json($updatePackageAssign, 200);
                if($packageAssignData["deleted"] == false) {
                    $updatePackageAssign->validFrom =$packageAssignData["validFrom"];
                    $updatePackageAssign->validTo =$packageAssignData["validTo"];
                    $updatePackageAssign->stylistId =$packageAssignData["stylistId"];
                    $updatePackageAssign->advanceAmount =$packageAssignData["advanceAmount"];
                  $packageAssign = $updatePackageAssign->save();
                }
                else{
                    if(count($updatePackageAssign["customerPkgDetail"]) >=1)
                   
                    {
                        for($i = 0; $i < count($updatePackageAssign["customerPkgDetail"]); $i++ )
                        {
                            if($updatePackageAssign["customerPkgDetail"][$i]["id"] != "" )
                            {
                                $deletePackageDetail = CustomerPackageDetail::find($updatePackageAssign["customerPkgDetail"][$i]["id"]);
                                $r = $deletePackageDetail->delete();
                            }
                        }
                    }
                    $updatePackageAssign->delete();
                    $packageAssign = "delete";

                }
            } else{
                $packageAssign = CustomerPackage::create($packageAssignData);
                $packageData = $packageAssignData;
                
                if(count($packageData["packagedetails"]) != 0){
                   
                    for($i = 0; $i<count($packageData["packagedetails"]); $i++ ){
                        $packageData["packagedetails"][$i]["custPackageId"] = $packageAssign->id;
                        CustomerPackageDetail::create($packageData["packagedetails"][$i]);
                    }
                }
            }
           // $packageAssign = CustomerPackage::create($packageAssignData);
        }


        if(!is_null($packageAssign)){
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
