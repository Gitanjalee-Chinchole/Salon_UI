<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
     protected $fillable = ['name','parentName','gander','mobile','email','birthday','dateOfJoining','department','position','pAddress','rAddress','active','stylist','image'];
     protected $casts = [
        'stylist' => 'boolean',
    ];
     public function serviceCommRate(){
        return $this->hasMany('App\EmployeeServiceCommission','employeeId','id');
    }
    public function workingHours(){
        return $this->hasOne('App\EmployeeWorkingTime','employeeId','id');
    }

    public function fixedDayWorkingHours(){
        return $this->hasMany('App\EmployeeParticularWorkingTime','employeeId','id');
    }
}
