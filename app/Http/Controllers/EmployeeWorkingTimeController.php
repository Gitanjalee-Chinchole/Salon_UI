<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\EmployeeWorkingTime;
use App\Employee;
use App\EmployeeParticularWorkingTime;
use Carbon\Carbon;

class EmployeeWorkingTimeController extends Controller
{
    public function index()
    {
        $employee_times = EmployeeWorkingTime::with('employee')->get();
 		return response()->json($employee_times, 200);
    }
    public function paginateindex(Request $request)
    {
        if($request->input('searchkey') !=null ){
            $searchstring = $request->input('searchkey');
            $employee_times = EmployeeWorkingTime::with("employee")
            ->select('employee_workingtimes.*')
            ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                    ->orWhere('start_time','LIKE','%'.$request->input('searchkey').'%')
                    ->orWhere('end_time','LIKE','%'.$request->input('searchkey').'%')
                    ->orWhereHas('employee', function($q) use ($searchstring) { 
                        $q->Where('name', 'LIKE', '%'.$searchstring.'%');
                      })
                    ->orderBy($request->input('sort'), $request->input('direction'))
                    ->paginate($request->input('employeesPerPage'));
             } else{
                $employee_times = EmployeeWorkingTime::with("employee")->select('employee_workingtimes.*')
                ->orderBy($request->input('sort'), $request->input('direction'))
                    ->paginate($request->input('employeesPerPage'));
            }
            return response()->json($employee_times, 200);

        // $employee_times = EmployeeWorkingTime::with('employee')->paginate(10);
 		// return response()->json($employee_times, 200);
    }

    public function show($id)
    {
        // $currentDate = Carbon::today();
        // $particilar_employee_times = EmployeeParticularWorkingTime::where('particular_date', '=', $currentDate)->find($id);
        $employee_times = EmployeeWorkingTime::with('employee')->find($id);
        // $response["employee_times"] =$employee_times;
        // $response["particilar_employee_times"] =$particilar_employee_times;
 		return response()->json($employee_times, 200);
    }

    public function store(Request $request)
    {
         $newdata = $request->all();
         $particularDate =  $newdata['particularStart_Date'];
            if(count($particularDate) !== 0){
                $empid = $newdata['employeeId'];
                $isemployee = EmployeeParticularWorkingTime::where('employeeId','=',$empid)->where('particular_date', '=' , $newdata['particularStart_Date'])->get();
                if(count($isemployee)==0 ) {
                    $particularemployee_times = EmployeeParticularWorkingTime::create(array(
                        "employeeId" =>  $newdata["employeeId"],
                        "particular_date" =>  $newdata["particularStart_Date"],
                        "particularstart_time" =>  $newdata["particularStart_time"],
                        "particularend_time" =>  $newdata["particularEnd_time"],
                        "comment" => $newdata["comment"],
                        )); 
                }else{
                    $particularemployee_times = EmployeeParticularWorkingTime::where('id', '=',  $isemployee[0]->id)->update(array(
                        "employeeId" =>  $newdata["employeeId"],
                        "particular_date" =>  $newdata["particularStart_Date"],
                        "particularstart_time" =>  $newdata["particularStart_time"],
                        "particularend_time" =>  $newdata["particularEnd_time"],
                        "comment" => $newdata["comment"],
                        )); 
                }
                // $particularemployee_times = EmployeeParticularWorkingTime::create(array(
                //     "employeeId" =>  $newdata["employeeId"],
                //     "particular_date" =>  $newdata["particularStart_Date"],
                //     "particularstart_time" =>  $newdata["particularStart_time"],
                //     "particularend_time" =>  $newdata["particularEnd_time"],
                //     "comment" => $newdata["comment"],
                //     )); 
            }
         $empid = $newdata['employeeId'];
         $isemployee = EmployeeWorkingTime::where('employeeId','=',$empid)->get();
        if(count($isemployee)==0 ) {
            // $employee_times = EmployeeWorkingTime::create($request->all());   
            // return response()->json($employee_times, 201);
            $employee_times = EmployeeWorkingTime::create(array(
                "employeeId" =>  $newdata["employeeId"],
                "start_time" =>  $newdata["start_time"],
                "end_time" =>  $newdata["end_time"],
                "mon" =>  $newdata["workingDays"][0]["Mon"],
                "tue" => $newdata["workingDays"][1]["Tues"],
                "wed" => $newdata['workingDays'][2]['Wed'],
                "thu" => $newdata['workingDays'][3]['Thurs'],
                "fri" => $newdata['workingDays'][4]['Fri'],
                "sat" => $newdata['workingDays'][5]['Sat'],
                "sun" => $newdata['workingDays'][6]['Sun'],
                )); 
                return response()->json($employee_times, 201);
        } else{
            $employee_times = EmployeeWorkingTime::where('id', '=', $isemployee[0]->id)->update(array(
                "employeeId" =>  $newdata["employeeId"],
                "start_time" =>  $newdata["start_time"],
                "end_time" =>  $newdata["end_time"],
                "mon" =>  $newdata["workingDays"][0]["Mon"],
                "tue" => $newdata["workingDays"][1]["Tues"],
                "wed" => $newdata['workingDays'][2]['Wed'],
                "thu" => $newdata['workingDays'][3]['Thurs'],
                "fri" => $newdata['workingDays'][4]['Fri'],
                "sat" => $newdata['workingDays'][5]['Sat'],
                "sun" => $newdata['workingDays'][6]['Sun'],
                )); 
                return response()->json($employee_times, 201);
            // $employeeWorkingTime = EmployeeWorkingTime::find($isemployee[0]->id);
            // $input = $request->all();
            // $employeeWorkingTime->fill($input)->save();
            // return response()->json($employeeWorkingTime, 200);
        } 
    }
    public function update(Request $request, $id)
    {
        $newdata = $request->all();
        $particularDate =  $newdata['particularStart_Date'];
            if(count($particularDate) !== 0){ 
                $empid = $newdata['employeeId'];
                $isemployee = EmployeeParticularWorkingTime::where('employeeId','=',$empid)->where('particular_date', '=' , $newdata['particularStart_Date'])->get();
                if(count($isemployee)==0 ) {
                    $particularemployee_times = EmployeeParticularWorkingTime::create(array(
                        "employeeId" =>  $newdata["employeeId"],
                        "particular_date" =>  $newdata["particularStart_Date"],
                        "particularstart_time" =>  $newdata["particularStart_time"],
                        "particularend_time" =>  $newdata["particularEnd_time"],
                        "comment" => $newdata["comment"],
                        )); 
                }else{
                    $particularemployee_times = EmployeeParticularWorkingTime::where('id', '=',  $isemployee[0]->id)->update(array(
                        "employeeId" =>  $newdata["employeeId"],
                        "particular_date" =>  $newdata["particularStart_Date"],
                        "particularstart_time" =>  $newdata["particularStart_time"],
                        "particularend_time" =>  $newdata["particularEnd_time"],
                        "comment" => $newdata["comment"],
                        )); 
                }
            }
       
        $employee_times = EmployeeWorkingTime::where('id', '=', $id)->update(array(
            "employeeId" =>  $newdata["employeeId"],
            "start_time" =>  $newdata["start_time"],
            "end_time" =>  $newdata["end_time"],
            "mon" =>  $newdata["workingDays"][0]["Mon"],
            "tue" => $newdata["workingDays"][1]["Tues"],
            "wed" => $newdata['workingDays'][2]['Wed'],
            "thu" => $newdata['workingDays'][3]['Thurs'],
            "fri" => $newdata['workingDays'][4]['Fri'],
            "sat" => $newdata['workingDays'][5]['Sat'],
            "sun" => $newdata['workingDays'][6]['Sun'],
            )); 
            return response()->json($employee_times, 201);

        // $employeeWorkingTime = EmployeeWorkingTime::find($id);

        // if(!is_null($employeeWorkingTime)){
            
        //     $input = $request->all();
        //     $employeeWorkingTime->fill($input)->save();
        //     return response()->json($employeeWorkingTime, 200);
        // }
    }

    public function delete($id)
    {
        $employee_times = EmployeeWorkingTime::find($id)->delete();
        return response()->json($employee_times, 200);
    }

}
