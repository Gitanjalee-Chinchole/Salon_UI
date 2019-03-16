<?php

namespace App\Http\Controllers;
use App\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Excel;
use Carbon\Carbon;
use App\Item;

class CategoryController extends Controller
{
    public function index()
    {
        // all non-softdeleted categories 
        //return Category::with('items')->get();
        $parentCategories =  Category::with('parent_cat')->get();
        return response()->json($parentCategories, 200);
    }
    
    public function getByParentCat($id)
    {
        // all non-softdeleted categories 
        $subCategories =  Category::where('parent_category',$id)->get();
        return response()->json($subCategories, 200);
    }
    public function filterCategorys(Request $request){

       // return Category::with('parent_cat')->paginate(2);
        if($request->input('searchkey') !=null ){
            $category = Category::with('parent_cat')
                ->select('categories.*')
                ->orWhere('id','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('categorie','LIKE','%'.$request->input('searchkey').'%')
                ->orWhere('created_at','LIKE','%'.$request->input('searchkey').'%')
                 ->orWhere('parent_category','LIKE','%'.$request->input('searchkey').'%')
                ->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('unitsperpage'));
     
        }
        else{
            $category = Category::with('parent_cat')
                ->select('categories.*')->orderBy($request->input('sort'), $request->input('direction'))
                ->paginate($request->input('unitsperpage'));
        }

        return response()->json($category, 200);
    }
    

    public function show(Category $category)
    {
        return $category;
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
        $caterory = Category::create($request->all());   
        return response()->json($caterory, 201);
    }
    private function storeValidator($data)
{
     return Validator::make($data, [
            'categorie' => 'required|unique:categories|max:255'
            ]);
}

    public function update(Request $request, Category $category)
    {
            $data = $request->all();
            $validator = $this->updateValidator($data, $category->id);
              if($validator->fails())
             {
                //return duplicateUnit($validator);
              return $this->respondWithError($validator->errors());
             }

        $category->update($request->all());

        return response()->json($category, 200);
    }
    private function updateValidator($data,$category)
    {
     return Validator::make($data, [
            'categorie' => 'required|unique:categories,categorie,'.$category.'|max:255'
            ]);
    }

    public function delete($id)
    {
        // $category->delete();
        // return response()->json(null, 204);
         $category  = Category::find($id);
        $productCode = Category::where("parent_category","=",$id)->first(); 
        $itemCheck = Item::where("category","=",$id)->first();
        if(is_null($itemCheck) && is_null($productCode)){

            (!is_null($category)) ?  ($r = $category->delete()) : ($r = null);

            if($r){
                $res = array('status' =>  'success' , "data" =>array(), "message" => trans("validation.success_delete",["attribute" => trans('glob.category') ]));
            } else{
               $res = array('status' =>  "error", "data" =>array(), "message" => trans("validation.error_delete",["attribute" => trans('glob.category') ]));
            }
            return response($res, 200);
        }else{
            return response( $res = array('status' =>  'warning' , "data" =>array(), "message" =>'Association exist , '.$category["categorie"].' Category cant be deleted'), 200);
        }
    }

    /** export to PDF Categories list */
     public function exportToXls(){
        $data = Category::all();    
        if(sizeof($data)){ 
          $carbon = Carbon::today();
          $timestamp = $carbon->timestamp;
          $format = $carbon->format('Y-m-d');
          $exportName = 'Category'.$format; 

          Excel::create($exportName, function ($excel) {

            $excel->sheet('Category', function ($sheet) {

                $dataList = Category::get();  
                $parentCategories = Category::where("parent_category","=","0")->get(); 

                $itemList = array();
                foreach ($dataList as $o) {
                    $parentcat = '';
                    if($o->parent_category === 0){
                        $parentcat = 'Parent Category';
                    } else{
                      $parentcat = $o->parentCategory->categorie; 
                  }

                  array_push($itemList, array(
                   trans('glob.id')  => $o->id,
                   trans('glob.category')  => $o->categorie,
                   trans('glob.parentCategory') => $parentcat                                    
                   )
                  );
              }

        // setting column names for data - you can of course set it manually
        $sheet->appendRow(array_keys($itemList[0])); // column names

        
        // getting last row number (the one we already filled and setting it to bold
        $sheet->row($sheet->getHighestRow(), function ($row) {
            $row->setFontWeight('bold');
        });

        // putting users data as next rows
        foreach ($itemList as $user) {
            $sheet->appendRow($user);
        }
    });

        })->download('xlsx');


         // return response()->json(['status' => 'downloded'], 200);

      }
}
}
