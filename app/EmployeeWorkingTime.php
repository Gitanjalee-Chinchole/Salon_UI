<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class EmployeeWorkingTime extends Model
{
    
    protected $fillable = ['employeeId' , 'start_time', 'end_time', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
   
   protected $table = 'employee_workingtimes';
   
   public function employee()
    {
        return $this->hasOne('App\Employee','id','employeeId');
    }
}
