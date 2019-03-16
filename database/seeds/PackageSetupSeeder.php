<?php

use Illuminate\Database\Seeder;
use App\PackageSetup;

class PackageSetupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
         PackageSetup::truncate();
        $faker = Faker\Factory::create();
       
        DB::table('package_setups')->insert([
            'packageName' => 'Test',
            'validFor' => '5',
            'packageCommission' => '10',
            'totalCost' => '5000'
        ]);
       
    }
}
