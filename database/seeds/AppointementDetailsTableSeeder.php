<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\AppointementDetails;

class AppointementDetailsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        appointementdetails::truncate();
        $faker = Faker\Factory::create();
        
            DB::table('appointement_details')->insert(
                [
                'itemId' => 1,
                'appointementId' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now() 
            ]);
    }
}
