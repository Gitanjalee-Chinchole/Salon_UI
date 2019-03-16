<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Appointement;
use App\AppointementDetails;
use Carbon\Carbon;
use Exception;
use App\EmployeeWorkingTime;
use DB;

class AppointementController extends Controller
{
    public function index() 
    {
        $appointements = Appointement::with(['customer','stylist','services.service','services'=>
        function($query){
            $query->orderBy('id','asc');
        }])->get();
        return response()->json($appointements, 200);   
    }
    
    public function show($id)
    {
        $appointement = Appointement::with(['customer','stylist','services.service','services'=>
        function($query){
            $query->orderBy('id','asc');
        }
        ])
        ->find($id); 
        return response()->json($appointement, 200);   
    }

    public function rebook(Request $request)
    {
        $data =  $request->all();
        $appointementId = $data["appointementId"];
        $appointement_to_rebook = Appointement::with('services.service')->find($appointementId);
        $appointement_to_rebook["status"] = "checkOut";
        $appointement_to_rebook->save();

        $rebook_appointement = $appointement_to_rebook;
        $reappt_date = Carbon::parse(date_format( new Carbon($data["reapptDate"]),'Y-m-d H:i:s'));
        $appointement = Appointement::insertGetId(array(
            "appointement_date" => Carbon::parse($reappt_date),
            "customerId" => $rebook_appointement["customerId"],
            "confirmed_by" => $rebook_appointement["confirmed_by"],
            "stylistId" => $rebook_appointement["stylistId"],
            "status" => "open",
            "totalCost" => $rebook_appointement["totalCost"],
            "created_at"  => Carbon::now(),
            "updated_at" => Carbon::now()
            ));

            if(count($rebook_appointement["services"])!=0)
            {   
              for($i=0;$i<count($rebook_appointement["services"]);$i++)
              {
                $rebook_appointement["services"][$i]['appointementId'] = $appointement;
                if($i==0)
                {
                    $rebook_appointement["services"][$i]['started_on'] = $reappt_date;
                    $service_time =new Carbon($rebook_appointement["services"][$i]['service']['serviceTime']);
                    $service_end_on = Carbon::create($reappt_date->year, $reappt_date->month, $reappt_date->day, $reappt_date->hour , $reappt_date->minute, $reappt_date->second);
                     
                    $service_end_on->addHours($service_time->hour);
                    $service_end_on->addMinutes($service_time->minute);
                    $rebook_appointement["services"][$i]['end_on'] = $service_end_on;
                } else {
                    $previous_end_on =  $rebook_appointement["services"][$i-1]['end_on'];
                    $rebook_appointement["services"][$i]['started_on'] = $previous_end_on;
             
                    $service_time = Carbon::parse($rebook_appointement["services"][$i]['service']['serviceTime']);
                    $previous_end_on = Carbon::create($previous_end_on->year, $previous_end_on->month, $previous_end_on->day, $previous_end_on->hour , $previous_end_on->minute, $previous_end_on->second);
                    $previous_end_on->addHours($service_time->hour);
                    $previous_end_on->addMinutes($service_time->minute);
                    $rebook_appointement["services"][$i]['end_on'] = $previous_end_on;
                }
              
                $rebook_appointement["services"][$i]['created_at']  = Carbon::now();
                $rebook_appointement["services"][$i]['updated_at'] = Carbon::now();
                AppointementDetails::create($rebook_appointement["services"][$i]->toArray());
              }
             }
            $res = array(
                    "status"  => "success",
                    "msg"   => 'Appointement Rebooked successfully!!'
                    );
        return response()->json($res, 200); 
    }

    public function appointementByDate(Request $request)
    {
        $appt_date_start = $request->input('date') . ' 00:00:00';
        $appt_date_end = $request->input('date') . ' 23:59:59';
        $appointements  =DB::select("select * from appointements where appointement_date  between '" .$appt_date_start. "' and '" .$appt_date_end. "' ");
        return response()->json($appointements, 200); 
    }

    public function getbetweendates(Request $request)
    {
        $appt_date_start = $request->input('fromDate');
        $appt_date_end = $request->input('toDate');
        $stylist = $request->input('stylist');
        $appointements;
        if($stylist == "all")
        {
        // $appointements  =DB::select("select * from appointements where appointement_date  between '" .$appt_date_start. "' and '" .$appt_date_end. "' ");
        $appointements = Appointement::with(['customer','stylist','services.service','services'=>
        function($query){
            $query->orderBy('id','asc');
        }])
        
        ->whereBetween('appointement_date',[ $appt_date_start, $appt_date_end])
        ->where('status','<>','cancel')
        ->get();
    }
        else {
          //  $appointements  =DB::select("select * from appointements where appointement_date  between '" .$appt_date_start. "' and '" .$appt_date_end. "' and stylistId = ".$stylist." ");
          $appointements = Appointement::with(['customer','stylist','services.service','services'=>
          function($query){
              $query->orderBy('id','asc');
          }])
          ->whereBetween('appointement_date',[ $appt_date_start, $appt_date_end])
          ->where('stylistId','=',$stylist)
          ->get();
        }
        return response()->json($appointements, 200); 
    }

    public function store(Request $request)
    {
        try 
        {
            $data = $request->all();

            $new_appt_start = Carbon::parse($data['appointement_date']); 
            $new_appt_end = Carbon::parse($data["serviceList"][count($data["serviceList"])-1]['end_on']);

            $appt_date_start = Carbon::parse($data['appointement_date']);
            $appt_date_end = Carbon::parse($data['appointement_date']);
            $appt_date_start -> setTime(0,0,0);
            $appt_date_end -> setTime(23,59,00);
            $tempdata = array();
          //  $appt_date_start = Carbon::parse($data['appointement_date']);
            // check for stylist available for saving appointement
             $appointements = Appointement::where('stylistId','=',$data['stylistId'])
              ->whereBetween('appointement_date',[ $appt_date_start, $appt_date_end])->get();
            
             if(count($appointements)!=0)
             {  
                for($i=0;$i<count($appointements);$i++)
                {
                    if(
                        (
                            (new Carbon($new_appt_start))->gte( (new Carbon(Carbon::parse($appointements[$i]['appointement_date']))) ) &&
                            (new Carbon($new_appt_start))->lte( (new Carbon(Carbon::parse($appointements[$i]['appointement_end_on']))) )
                        ) ||
                        (
                            (new Carbon($new_appt_end))->gte( (new Carbon(Carbon::parse($appointements[$i]['appointement_date']))) ) &&
                            (new Carbon($new_appt_end))->lte( (new Carbon(Carbon::parse($appointements[$i]['appointement_end_on']))) )
                        )

                        )
                    {
                        array_push($tempdata, 'blocked');
                    } 
                    else if(
                        (
                            (new Carbon( Carbon::parse($appointements[$i]['appointement_date'])))->gte( (new Carbon($new_appt_start) )) &&
                            (new Carbon( Carbon::parse($appointements[$i]['appointement_date'])))->lte( (new Carbon($new_appt_end)) )
                        ) ||
                        (
                            (new Carbon( Carbon::parse($appointements[$i]['appointement_end_on'])))->gte( (new Carbon($new_appt_start) )) &&
                            (new Carbon( Carbon::parse($appointements[$i]['appointement_end_on'])))->lte( (new Carbon($new_appt_end)) )
                        )
                    ) {
                        array_push($tempdata, 'blocked');
                    }
                    else {
                        array_push($tempdata, 'free');
                    }
                }
             }
             else{
                 // no appointements for the dat for that stylist free to book an appointement
                 array_push($tempdata, 'no data ');
             }
            // check if stylist is available or not
            // $employee = EmployeeWorkingTime::with('employee')->find($data["stylistId"]);
            // $employee_start_time = Carbon::parse($employee['start_time']);
            // $employee_end_time = Carbon::parse($employee['end_time']);
            // $appointement_start_time = Carbon::parse($data["appointement_date"]);
            // // get last service end_time i.e. appointement end_time
            // $last_service_index = count($data["serviceList"]) - 1;
            // $appointement_end_time = Carbon::parse($data["serviceList"][$last_service_index]['end_on']);

            // if($employee_start_time > $appointement_start_time)
            // {

            // }
            // $appointement_end_on = $data["serviceList"][count($data["serviceList"])-1]['end_on'];
            // $appointement = Appointement::insertGetId(array(
            //         "appointement_date" => Carbon::parse($data["appointement_date"]),
            //         "appointement_end_on" => Carbon::parse($appointement_end_on),
            //         "customerId" => $data["customerId"],
            //         "confirmed_by" => $data["confirmed_by"],
            //         "stylistId" => $data["stylistId"],
            //         "status" => $data["status"],
            //         "totalCost" => $data["totalCost"],
            //         "created_at"  => Carbon::now(),
            //         "updated_at" => Carbon::now()
            //         ));

            // if(count($data["serviceList"])!=0)
            // {   
            //   for($i=0;$i<count($data["serviceList"]);$i++)
            //   {
            //     $data["serviceList"][$i]['appointementId'] = $appointement;
            //     AppointementDetails::create($data["serviceList"][$i]);
            //   }
            // }
             
            $res = array(
                "status"  => "success",
                "msg"   => "Appointement saved successfully!!",
                "id" => ''
                );
             return response()->json($tempdata, 200);   
            }
            
            catch(Exception $e)
            {
                $res = array(
                    "status"  => "Error",
                    "msg"   => $e->getMessage()
                    );
                return response()->json($res, 200);   
            }
    }

    public function update(Request $request, Appointement $appointement)
    {
    
        $duplicate = false;
        $data = $request->all();
         $appointement = Appointement::find($data["id"]);
    
        $response = array();
        try {
        if(count($data["serviceList"])>=1)
        {
        for($i=0;$i<count($data["serviceList"]);$i++)
        {
            if($data["serviceList"][$i]["id"]== null )
            {
                $data["serviceList"][$i]['appointementId'] = $data["id"];
                AppointementDetails::create($data["serviceList"][$i]);
            } 
            else {
            if($data["serviceList"][$i]["deleted"]==true)
            {
                $removeService =AppointementDetails::find($data["serviceList"][$i]["id"]);
                $removeService->delete();
            }else {
                $removeService = AppointementDetails::find($data["serviceList"][$i]["id"]);
                $removeService-> started_on =$data["serviceList"][$i]["started_on"];
                $removeService-> end_on =$data["serviceList"][$i]["end_on"];
                $removeService->save();
            }
        }
        }
        }
        $appointement->fill($data)->save();
        $res = array(
            "status"  => "success",
            "msg"   => "Appointement updated successfully!!",
            "id" => $appointement
            );
            return response()->json($res, 200);   
    } catch(Exception $e)
    {
        $res = array(
            "status"  => "Error",
            "msg"   => $e->getMessage()
            );
        return response()->json($res, 200);   
    }
    }
}
