<?php

use Illuminate\Database\Seeder;
use App\User;
use Carbon\Carbon;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
      User::truncate();
      for ($i = 0; $i < 1; $i++) {
        DB::table('users')->insert([ 
        'username' => 'Admin',
        'email' => 'admin@gmail.com',
        'role' => 2,
        'floor' => 'Floor 1',
        'password' => bcrypt('123456'),
        'remember_token' => str_random(10),
        'created_at' => Carbon::now(),
        'updated_at' => Carbon::now()
  ]);
   }
    }
}
