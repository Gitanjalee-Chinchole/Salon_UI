<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Kernel;
use Validator;
use App\Role;
use App\User;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('users')->get();
        // $roles = Role::sortable()->paginate(5);

 		return $roles->toArray();
       
    }

    public function show($id)
    {
        $roles = Role::find($id);
        return $roles;
    }

        public function store(Request $request)
        {
             $Obj = $request->all();
             
            $validator = Validator::make($Obj, [
                'role' => 'required|unique:roles,role',
            ]);

            if($validator->fails()){
                return $this->respondWithError($validator->errors());      
            }
    
            $roles = Role::create($Obj);
            return response()->json($roles, 201);
    
        }

        public function update(Request $request, $id)
        {
            $Obj = $request->all();
            
              $validator = Validator::make($Obj, [
                  'role' => 'required|unique:roles,role,'.$id.'',
               ]);
        
              if($validator->fails()){
                  return $this->respondWithError($validator->errors()); 
               }

             $roles = Role::findorfail($id);
             $roles->update($request->all());
             return response()->json($roles, 201); 
          }
          // public function delete($id)
          // {
      
          //   $roles = Role::findOrFail($id);
          //   $roles->delete();
        
          //     return  $roles;
          // }

            public function delete($id)
            {
              $sizeusers = User::where("role","=",$id)->first();
              if(sizeof($sizeusers) == 0)
              {
             $roles = Role::with(["users"])->find($id);
             Role::find($id)->delete();
             $response["status"] ="success";
           }
           else{
            $response = array('status' =>  "warning", "data" =>array(),  "message" =>' Role Exists in User, Cant delete Role!' );
           }
           return Response($response,200);
            }

          public function retrive()
          {
            return $roles = Role::onlyTrashed()->get();       
          }
      
         public function restore($id)
          {
             $roles = Role::withTrashed()->restore();
             return ['Message'=>'Data Restored Successfully','ID'=>$id];
          }

          public function filter(Request $request)
          {
              if($request->input('searchkey') !=null)
              {
                  $roles = Role::select('roles.*')
                  ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('role','LIKE','%'.$request->input('searchkey').'%')
                  ->orderBy($request->input('sort'), $request->input('direction'))
                  ->paginate($request->input('rolesPerPage'));
              }
              else{
                $roles = Role::select('roles.*')->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('rolesPerPage'));
            }
    
            return response()->json($roles, 200);
          }

}
