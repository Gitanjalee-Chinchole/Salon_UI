<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Http\Kernel;
use Validator;
use App\User;
use App\Role;

class UserController extends Controller
{
      public function index()
    {
    $users = User::with("role")->get();
     return response()->json($users, 200);

     // $users = DB::table('users')
     //        ->join('roles', 'users.id', '=', 'roles.id')
     //        ->select('users.*', 'roles.role')
     //        ->get();
     //   return response()->json($users, 200);
    }

    public function show($id)
    {
        $users = User::find($id);
        return $users;
    }

        public function store(Request $request)
        {
             $Obj = $request->all();
             
            $validator = Validator::make($Obj, [
                'username' => 'required|unique:users',
                'password'=> 'required',
                'role'=> 'required',
            ]);

            if($validator->fails()){
                return $this->respondWithError($validator->errors());    
            }
            $Obj['password'] = bcrypt($Obj['password']);
            $users = User::create($Obj);
            return response()->json($users, 201);
    
        }

        public function update(Request $request, $id)
        {
           $Obj = $request->all();
            
              $validator = Validator::make($Obj, [
                'username' => 'required|unique:users,username,'.$id.'',
                'role'=> 'required' 
              ]);
        
              if($validator->fails()){
                  return $this->respondWithError($validator->errors()); 
               }
             $users = User::findorfail($id);

              if($Obj['password'] == ''){
                  $Obj['password']= $users->password;
                } 
                else if($Obj['password'] !== null || $Obj['password'] !== ''){
                    $Obj['password']= bcrypt($Obj['password']);
                }
             $users->update($Obj);
             return response()->json($users, 200); 
          }
          public function delete($id)
          {
      
            $users = User::findOrFail($id);
            $users->delete();
        
            return response()->json($users, 200);
          }
          public function retrive()
          {
             $users = User::onlyTrashed()->get();      
            return response()->json($users, 200); 
          }
      
         public function restore($id)
          {
             $users = User::withTrashed()->restore();
             return ['Message'=>'Data Restored Successfully','ID'=>$id];
          }

          public function filter(Request $request)
          {
              if($request->input('searchkey') !=null)
              {
                  $users = User::with("role")->select('users.*')
                  ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('username','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('floor','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('role','LIKE','%'.$request->input('searchkey').'%')
                  ->orderBy($request->input('sort'), $request->input('direction'))
                  ->paginate($request->input('usersPerPage'));
              }
              else{
                $users = User::with("role")->select('users.*')->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('usersPerPage'));
            }
    
            return response()->json($users, 200);
          }

}
