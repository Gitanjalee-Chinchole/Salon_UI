<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class EmployeeParticularWorkingTime extends Model
{
    protected $fillable = ['employeeId', 'particular_date', 'particularstart_time', 'particularend_time', 'comment' ];
   
    protected $table = 'employee_particular_workingtimes';
    
    public function employee()
     {
         return $this->hasOne('App\Employee','id','employeeId');
     }
}
