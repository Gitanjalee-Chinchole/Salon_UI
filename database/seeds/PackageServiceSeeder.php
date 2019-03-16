<?php

use Illuminate\Database\Seeder;
use App\PackageService;

class PackageServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
      PackageService::truncate();
        $faker = Faker\Factory::create();
       
        DB::table('package_services')->insert([
            'packageId' => 1,
            'itemId' => 1,
            'quantity' => '5',
            'rate' => '100',
            'amount' => '500'
        ]);
    }
}
