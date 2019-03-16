<?php

use Illuminate\Database\Seeder;
use App\Employee;
use Carbon\Carbon;

class EmployeeTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Employee::truncate();
        $faker = Faker\Factory::create();
        for($i=1;$i<=1;$i++){ 
        DB::table('employees')->insert([
            'name' => 'Manish',
            'parentName' => '',
            'gander' => '1',
            'mobile' => '9860371050',
            'email' => 'manish@gmail.com',
            'birthday' => '1993-08-06',
            'dateOfJoining'=> '2017-03-14',
            'department' => '',
            'position' => '',
            'pAddress' => 'Amravati',
            'rAddress' => 'pune',
            'active' => '1',
            'stylist' => '1',
            'image' => ''
        ]);
        }
    }
}
