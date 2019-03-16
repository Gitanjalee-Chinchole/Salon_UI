<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Appointement;

class AppointementTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        appointement::truncate();
        $faker = Faker\Factory::create();
        
            DB::table('appointements')->insert(
                [
                'appointement_date' => Carbon::now(),
                'customerId' => 1,
                'stylistId' => 1,
                'confirmed_by' => 'E-mail',
                'status' => 'Open',
                "totalCost" => 0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now() 
            ]);
    }
}
