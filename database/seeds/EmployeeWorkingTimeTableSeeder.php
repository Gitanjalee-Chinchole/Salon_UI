<?php

use Illuminate\Database\Seeder;
use App\EmployeeWorkingTime;
use Carbon\Carbon;

class EmployeeWorkingTimeTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
       DB::table('employee_workingtimes')->truncate();
           DB::table('employee_workingtimes')->insert(array(
               array('employeeId' => 1,'start_time' => '10:00:00' ,'end_time' => '19:00:00' ,'created_at' => Carbon::now(),'updated_at' => Carbon::now())
           )); 
    }
}
