<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class EmployeeServiceCommission extends Model
{
        protected $fillable = ['employeeId','itemId','comm_rate'];
     public function serviceItem()
    {
        return $this->hasOne('App\Item','id','itemId');      
    }
}
