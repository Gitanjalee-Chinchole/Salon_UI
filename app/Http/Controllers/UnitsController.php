<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Unit;
use App\Item;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;


class UnitsController extends Controller
{
    public function index()
    {
        $allunits = Unit::all();
        return response()->json($allunits, 200);
    }

    public function filterUnits(Request $request)
    {
       
        if($request->input('searchkey') !=null ){
            $units = Unit::select('units.*')
                ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('unit','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('created_at','LIKE','%'.$request->input('searchkey').'%')
                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('unitsperpage'));
        }
        else{
            $units = Unit::select('units.*')->orderBy($request->input('sort'), $request->input('direction'))
            ->paginate($request->input('unitsperpage'));
        }

        return response()->json($units, 200);
    }
    
    public function show(Unit $unit)
    {
        return $unit;
    }

    public function store(Request $request)
    {
            $data = $request->all();
            $validator = $this->storeValidator($data);
              if($validator->fails())
             {
                //return duplicateUnit($validator);
              return $this->respondWithError($validator->errors());
              }
             
            $unit = Unit::create($request->all());
            return response()->json($unit, 201);
        }

private function storeValidator($data)
{
     return Validator::make($data, [
            'unit' => 'required|unique:units|max:255'
            ]);
}
    public function update(Request $request, Unit $unit)
    {
        $data = $request->all();
            $validator = $this->updateValidator($data, $unit->id);
              if($validator->fails())
             {
                //return duplicateUnit($validator);
              return $this->respondWithError($validator->errors());
             }
        
        $unit->update($request->all());

        return response()->json($unit, 200);
    }
    private function updateValidator($data,$unit)
    {
     return Validator::make($data, [
            'unit' => 'required|unique:units,unit,'.$unit.'|max:255'
            ]);
    }
    public function delete($id)
    {
        $res = array();
        $unit = Unit::find($id);
        $item = Item::where("unit", "=",$id)->get();
        if(!$item->isEmpty()){
            $res = array('status' =>  "warning", "data" =>array(), "message" => "Unable to delete since associated with Item ");
            return Response($res);
        }

        (!is_null($unit)) ?  ($r = $unit->delete()) : ($r = null);

        if($r){
            $res = array('status' =>  "success", "data" =>array(), "message" => "Unit deleted successfully!!");
        }
        else{
            $res = array('status' =>  "error", "data" =>array(), "message" => "Unable to delete unit");
        }

        return Response($res);
    }
  
}
