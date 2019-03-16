<?php

use Illuminate\Database\Seeder;
use App\Supplier;

class SuppliersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('suppliers')->truncate();
        factory(Supplier::class,1)->create([
             'title' => 1,
             'type' => 'Supplier'
            //  'address' => $faker->address,
            //  'office_no' => $faker->tollFreePhoneNumber,
            // 'mobile_no' => $faker->e164PhoneNumber,
            // 'fax' => $faker->e164PhoneNumber,
            // 'city' => $faker->city
        ]);
    }
}
