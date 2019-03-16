<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\EmployeeServiceCommission;
class EmployeeServiceCommissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
         Employeeservicecommission::truncate();
        DB::table('employee_service_commissions')->insert(array(
            array('employeeId' => 1 , 'itemId' => 2 , 'comm_rate' => 5 ,'created_at' => Carbon::now(),'updated_at' => Carbon::now())
            ));
    }
}
