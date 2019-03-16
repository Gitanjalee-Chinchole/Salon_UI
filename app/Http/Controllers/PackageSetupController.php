<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\PackageSetup;
use App\PackageService;
use Illuminate\Support\Facades\Validator;
use App\CustomerPackage;

class PackageSetupController extends Controller
{
     public function index() 
    {
        return PackageSetup::with(['packageServices.packageServiceItem.category.parentCategory'])->get();
    }
    
      public function paginatePackage(Request $request) 
    {
          if($request->input('searchkey') !=null ){
        $employee = PackageSetup::with(["packageServices"])
        ->select('package_setups.*')
        ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('packageName','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('validFor','LIKE','%'.$request->input('searchkey').'%')
                 ->orWhere('packageCommission','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('totalCost','LIKE','%'.$request->input('searchkey').'%')
                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('itemsPerPage'));
         } else{
            $employee = PackageSetup::with(["packageServices"])->select('package_setups.*')
            ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('itemsPerPage'));
        }
        return response()->json($employee, 200);
        //return PackageSetup::with(['packageServices'])->paginate(10);
    }

    //**** Add new Employee *****
     public function store(Request $request)
    {
        $duplicate = false;
        $inputData = $request->all();
        $response = array();
        $validate = $this->storeValidator($inputData);

        if($validate->fails())
        {
           return $this->respondWithError($validate->errors());
        }
        $response["status"] ="success";
        $item = PackageSetup::create($request->all());
        $itemData =$request->all();
       if(count($itemData["packageItems"])!=0)
       {   
         
         for($i=0;$i<count($itemData["packageItems"]);$i++)
         {
           $itemData["packageItems"][$i]['packageId']=$item->id;
             PackageService::create($itemData["packageItems"][$i]);
         }
        }

        return response()->json($response, 201);   
    }

    private function storeValidator($data)
    {
        return Validator::make($data, [
          'packageName' => 'required:package_setups',
          'validFor' => 'required:package_setups|max:10',
           ]);
    }
      public function show(PackageSetup $package)
    {
        $package = PackageSetup::with(['packageServices.packageServiceItem.category'])->where('id',$package->id)->get()->first();
        return $package;
    }
    public function update(Request $request, PackageSetup $item)
{

    $duplicate = false;
    $inputData = $item;
    $data = $request->all();
    $response = array();
  //  $barcode = Employee::with('ingredients')->where("barcode","=",$inputData["barcode"])->first(); 
    $validate = $this->updateValidator($data);

    if($validate->fails())
    {
        return $this->respondWithError($validate->errors());
    }

    if(count($data["packageItems"])>=1)
    {
    for($i=0;$i<count($data["packageItems"]);$i++)
    {
        if($data["packageItems"][$i]["id"]!="")
        {
            $updateIngredient =PackageService::find($data["packageItems"][$i]["id"]);
            if($data["packageItems"][$i]["deleted"]==false)
            {
            $updateIngredient->quantity =$data["packageItems"][$i]["quantity"];
            $updateIngredient->rate =$data["packageItems"][$i]["rate"];
            $updateIngredient->amount =$data["packageItems"][$i]["amount"];
            $updateIngredient->save();
            }
            else {
                $updateIngredient->delete();
            }
        }
        else {
           
            $data["packageItems"][$i]["packageId"]=$item->id;
            PackageService::create($data["packageItems"][$i]);
        }
    }
    }
    $response["status"] ="success";
   // $response["data"] = $barcode;
    $item->update($request->all());
 return response()->json($response, 200);
}
private function updateValidator($data)
    {
        return Validator::make($data, [
          'packageName' => 'required:package_setups,packageName,'.$data['id'].'',
         'validFor' => 'required:package_setups,validFor,'.$data['id'].'|max:10'
           ]);
    }


    // ***** Package Delete *****
     public function delete($id)
    {
        $isPackageAssign = CustomerPackage::where("packageId", "=",$id)->first();
        if(sizeof($isPackageAssign) == 0 )
        {

        $data = PackageSetup::with(['packageServices'])->find($id);
    if(count($data["packageServices"]) >= 1)
    {
       
    for($i=0;$i<count($data["packageServices"]);$i++)
    {
        if($data["packageServices"][$i]["id"]!="")
        {
            $deleteComService =PackageService::find($data["packageServices"][$i]["id"]);
                $r = $deleteComService->delete();
        }
    }
   
    }
        $data->delete();
       $response["status"] ="success";
    } else{
        $response = array('status' =>  "warning", "data" =>array(),  "message" =>' Package assign to customer, Cant delete Package!' );
    }
     return Response($response,200);
}

}
