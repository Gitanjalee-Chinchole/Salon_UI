<?php

use Illuminate\Database\Seeder;
use App\Role;
use Carbon\Carbon;
class RoleTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
       Role::truncate();
       $faker = Faker\Factory::create();
           DB::table('roles')->insert(array(
               array('role' => 'Admin','created_at' => Carbon::now(),'updated_at' => Carbon::now()), 
               array('unit' => 'User','created_at' => Carbon::now(),'updated_at' => Carbon::now())
           )); 
    }
}
