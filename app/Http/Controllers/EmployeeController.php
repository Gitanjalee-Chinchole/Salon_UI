<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Employee;
use Illuminate\Support\Facades\Validator;
use App\EmployeeServiceCommission;
use App\EmployeeParticularWorkingTime;
use Carbon\Carbon;

class EmployeeController extends Controller
{
     public function index(Request $request) 
    {
        return Employee::with(['serviceCommRate','workingHours', 'fixedDayWorkingHours'])->get();
    }
    public function paginateemployee(Request $request){
        
         if($request->input('searchkey') !=null ){
        $employee = Employee::with(["serviceCommRate"])
        ->select('employees.*')
        ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('name','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('mobile','LIKE','%'.$request->input('searchkey').'%')
                 ->orWhere('email','LIKE','%'.$request->input('searchkey').'%')
                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('employeesPerPage'));
         } else{
            $employee = Employee::select('employees.*')
            ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('employeesPerPage'));
        }
        return response()->json($employee, 200);
    }

     //**** Add new Employee *****
      public function stylist(Request $request) 
    {
        return Employee::with(['serviceCommRate'])->where('stylist','=',1)->get();
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
        $item = Employee::create($request->all());
        $itemData =$request->all();
       if(count($itemData["employee_service_comm"])!=0)
       {   
         
         for($i=0;$i<count($itemData["employee_service_comm"]);$i++)
         {
           $itemData["employee_service_comm"][$i]['employeeId']=$item->id;
             EmployeeServiceCommission::create($itemData["employee_service_comm"][$i]);
         }
        }

        return response()->json($response, 201);   
    }

    private function storeValidator($data)
    {
        return Validator::make($data, [
          'name' => 'required:employees',
          'mobile' => 'required|unique:employees|max:10',
          'pAddress' => 'required:employees',
          'rAddress' => 'required:employees',
          'email' => 'nullable|unique:employees|max:255'
           ],[
            'email.unique' => "The email has already been taken.",
            ]);
    }

     public function show(Employee $employee)
    {
        $employee = Employee::with(['serviceCommRate.serviceItem','workingHours', 'fixedDayWorkingHours'])->where('id',$employee->id)->get()->first();
        return response()->json($employee, 200);
    }

     //****  update Employee *****
    public function update(Request $request, Employee $item)
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

    if(count($data["employee_service_comm"])>=1)
    {
    for($i=0;$i<count($data["employee_service_comm"]);$i++)
    {
        if($data["employee_service_comm"][$i]["id"]!="")
        {
            $updateIngredient =EmployeeServiceCommission::find($data["employee_service_comm"][$i]["id"]);
            if($data["employee_service_comm"][$i]["deleted"]==false)
            {
            $updateIngredient->comm_rate =$data["employee_service_comm"][$i]["comm_rate"];
            $updateIngredient->save();
            }
            else {
                $updateIngredient->delete();
            }
        }
        else {
           
            $data["employee_service_comm"][$i]["employeeId"]=$item->id;
            EmployeeServiceCommission::create($data["employee_service_comm"][$i]);
        }
    }
    }
    $response["status"] ="success";
   // $response["data"] = $barcode;
    $item->update($request->all());
 return response()->json($response, 200);
}

public function getAvailableWorkingEmployees($date)
{
   // $appt_date =  Carbon::parse($date)->format('Y-m-d');
    $availableEmployees =  array();
     $allEmployees =Employee::with(['serviceCommRate','workingHours', 'fixedDayWorkingHours'])->get(); 
     

  //  array_push($availableEmployees, $filtered_collection);
     for($i=0;$i<count($allEmployees);$i++)
     {
      
       
      
        // if employee has manually set hours 
        if(count($allEmployees[$i]['fixedDayWorkingHours']) != 0)
        {
            for($j=0;$j<count($allEmployees[$i]['fixedDayWorkingHours']);$j++)
            {
                if((new Carbon(Carbon::parse($allEmployees[$i]['fixedDayWorkingHours'][$j]['particular_date'])->format('Y-m-d')))->eq((new Carbon(Carbon::parse($date)->format('Y-m-d'))) ))
                {
                    //array_push($availableEmployees, (new Carbon(Carbon::parse($date)->format('H:i:s')))->lt(new Carbon(Carbon::parse('2018-03-14 15:17:00')->format('H:i:s')  ))  );
                    
                 //  array_push($availableEmployees, (Carbon::parse('2018-03-14 15:15:00')->format('H:i:s')  ));
                   if((new Carbon(Carbon::parse($date)->format('H:i:s')))->lt(new  Carbon(Carbon::parse($allEmployees[$i]['fixedDayWorkingHours'][$j]['particularend_time'])->format('H:i:s')) )  )
                    {
                       
                        array_push($availableEmployees, $allEmployees[$i]);
                    }

                    // array_push($availableEmployees, $allEmployees[$i]);
                }
            }
        }
        else {
            
            if((new Carbon(Carbon::parse($date)->format('H:m:s')))->lt(new  Carbon(Carbon::parse($allEmployees[$i]['workingHours']['end_time'])->format('H:m:s')) )  )
            {
                array_push($availableEmployees, $allEmployees[$i]);
            }
        } 
        
       
     }

    return response()->json($availableEmployees, 200);
}

private function updateValidator($data)
    {
        return Validator::make($data, [
          'name' => 'required:employees,name,'.$data['id'].'',
         'mobile' => 'required|unique:employees,mobile,'.$data['id'].'|max:10',
         'pAddress' => 'required:employees, pAddress,'.$data['id'].'',
         'rAddress' => 'required:employees, rAddress,'.$data['id'].'',
         'email' => 'nullable|unique:employees,email,'.$data['id'].''
           ],[
            'email.unique' => "The email has already been taken.",
            ]);
    }


    public function delete($id)
    {
        $data = Employee::with(['serviceCommRate'])->find($id);
    if(count($data["serviceCommRate"]) >= 1)
    {
       
    for($i=0;$i<count($data["serviceCommRate"]);$i++)
    {
        if($data["serviceCommRate"][$i]["id"]!="")
        {
            $deleteComService =EmployeeServiceCommission::find($data["serviceCommRate"][$i]["id"]);
                $r = $deleteComService->delete();
        }
    }
   
    }
        $data->delete();
      return response()->json(null, 204);
    }
}
