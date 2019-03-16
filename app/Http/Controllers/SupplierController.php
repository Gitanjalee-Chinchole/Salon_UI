<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Kernel;
use Validator;
use App\Supplier;

class SupplierController extends Controller
{
    public function index()
    {
        return Supplier::all();
        // $suppliers = Supplier::sortable()->paginate(5);

 		// return $suppliers->toArray();
       
    }

    public function show($id)
    {
        $suppliers = Supplier::find($id);
        return $suppliers;
    }
        public function store(Request $request)
        {
             $data = $request->all();
            $validator = $this->storeValidator($data);
              if($validator->fails())
             {
              return $this->respondWithError($validator->errors());
             }
    
            $suppliers = Supplier::create($data);
            return response()->json($suppliers, 201);
    
        }
        private function storeValidator($data)
    {
     return Validator::make($data, [
            'company_name' => 'required',
             'office_no' => 'nullable | unique:suppliers|max:255',
             'mobile_no' => 'nullable|unique:suppliers|max:255',
             'email' => 'nullable|unique:suppliers|max:255'
            ],[
            'email.unique' => "The email has already been taken.",
            ]);
    }

        public function update(Request $request, $id)
        {
            $data = $request->all();
            $validator = $this->updateValidator($data,$id);
              if($validator->fails())
             {
                //return duplicateUnit($validator);
              return $this->respondWithError($validator->errors());
             }
             $suppliers = Supplier::findorfail($id);
             $suppliers->update($request->all());
             return response()->json($suppliers, 201); 
          }
 private function updateValidator($data,$id)
    {
     return Validator::make($data, [
            'company_name' => 'required:company_name'.$id.'',
            'office_no' => 'nullable |unique:suppliers,office_no,'.$id.'|max:255',
            'mobile_no' => 'nullable|unique:suppliers,mobile_no,'.$id.'|max:255',
            'email' => 'nullable|unique:suppliers,email,'.$id.'|max:255'
            ],[
            'email.unique' => "The email has already been taken.",
             ]);
    }
          public function delete($id)
          {
      
            $suppliers = Supplier::findOrFail($id);
            $suppliers->delete();
        
              return  $suppliers;
          }
          public function retrive()
          {
            return $suppliers = Supplier::onlyTrashed()->get();       
          }
      
         public function restore($id)
          {
             $suppliers = Supplier::withTrashed()->restore();
             return ['Message'=>'Data Restored Successfully','ID'=>$id];
          }

          public function filter(Request $request)
          {
              if($request->input('searchkey') !=null)
              {
                  $suppliers = Supplier::select('suppliers.*')
                  ->orWhere('type','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('title','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('company_name','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('contact','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('address','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('office_no','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('mobile_no','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('fax','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('email','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('ecc_no','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('cst_no','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('range_no','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('division','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('comm','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('pan_no','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('tin_no','LIKE','%'.$request->input('searchkey').'%')
                  ->orWhere('account_grp','LIKE','%'.$request->input('searchkey').'%')
                  ->orderBy($request->input('sort'),$request->input('direction'))
                  ->paginate($request->input('suppliersPerPage'));
              }
              else{
                $suppliers = Supplier::select('suppliers.*')->orderBy($request->input('sort'),$request->input('direction'))
                ->paginate($request->input('suppliersPerPage'));
            }
    
            return response()->json($suppliers, 200);
          }

}
