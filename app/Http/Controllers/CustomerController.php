<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Customer;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{

    public function index() 
    {
        return Customer::all();
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function paginatecustomer(Request $request) 
    {

      //return Customer::paginate(10);
       if($request->input('searchkey') !=null ){
            $custmoer = Customer::select('customers.*')
                ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('name','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('mobile','LIKE','%'.$request->input('searchkey').'%')
                 ->orWhere('city','LIKE','%'.$request->input('searchkey').'%')
                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('customersPerPage'));
     
        }
        else{
            $custmoer = Customer::select('customers.*')->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('customersPerPage'));
        }
        return response()->json($custmoer, 200);

    }
     /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
             $data = $request->all();
            $validator = $this->storeValidator($data);
              if($validator->fails())
             {
                //return duplicateUnit($validator);
              return $this->respondWithError($validator->errors());
             }
        $task = Customer::create($request->all());
        
        return response()->json($task, 201);
    }
 private function storeValidator($data)
    {
     return Validator::make($data, [
             'phone' => 'nullable | unique:customers|max:255',
             'mobile' => 'required|unique:customers|max:255',
            'email' => 'nullable|unique:customers|max:255'
            ],[
            'email.unique' => "The email has already been taken.",
            ]);
    }
    public function edit($id)
    {
        $customers = Customer::all();
        $editCustomer = Customer::where('id', $id)->first(); 
        return $editCustomer;
    }
     /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    { 
          $data = $request->all();
            $validator = $this->updateValidator($data,$id);
              if($validator->fails())
             {
                //return duplicateUnit($validator);
              return $this->respondWithError($validator->errors());
             }
        $customerData = Customer::find($id);

        if(!is_null($customerData)){
            
            $input = $request->all();
            $customerData->fill($input)->save();
            return response()->json($customerData, 200);
        }else{     
     }
 }
  private function updateValidator($data,$id)
    {
     return Validator::make($data, [
            'phone' => 'nullable |unique:customers,phone,'.$id.'|max:255',
            'mobile' => 'required|unique:customers,mobile,'.$id.'|max:255',
            'email' => 'nullable|unique:customers,email,'.$id.'|max:255'
            ],[
            'email.unique' => "The email has already been taken.",
             ]);
    }
    public function delete(Customer $customer)
    {
        $customer->delete();

        return response()->json(null, 204);
    }
}
