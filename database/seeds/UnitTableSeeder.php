<?php


use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Unit;

class UnitTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Unit::truncate();
        $faker = Faker\Factory::create();

            DB::table('units')->insert(array(
                array('unit' => 'PC','created_at' => Carbon::now(),'updated_at' => Carbon::now()), 
                array('unit' => 'Kg','created_at' => Carbon::now(),'updated_at' => Carbon::now()), 
                array('unit' => 'M','created_at' => Carbon::now(),'updated_at' => Carbon::now()), 
                array('unit' => 'G','created_at' => Carbon::now(),'updated_at' => Carbon::now()), 
                array('unit' => 'L','created_at' => Carbon::now(),'updated_at' => Carbon::now()), 
                ));
        
    }
}
