<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CommonController extends Controller
{
    public function get_autoIncremenetVal($tableName){
        $database = \DB::getDatabaseName();
        $result =\DB::select("SELECT auto_increment FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'salon'  and  table_name = '$tableName' ");
       // return (isset($result[0]->auto_increment)) ? $result[0]->auto_increment : 1;
       return response()->json( (isset($result[0]->auto_increment)) ? $result[0]->auto_increment : 1, 200);
      }
}
