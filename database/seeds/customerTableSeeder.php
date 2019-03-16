<?php

use Illuminate\Database\Seeder;
use App\Customer;
use Carbon\Carbon;

class CustomerTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Customer::truncate();
        $faker = Faker\Factory::create();
       
        DB::table('customers')->insert([
            'title' => '1',
            'name' => 'Walk In',
            'spouse' => '',
            'birthday' => '1993-08-06',
            'anniversary' => '1993-08-06',
            'address' => $faker->address,
            'phone' => '',
            'mobile' => '9715681224',
            'fax' => '',
            'email' => '',
            'city' => 'Pune',
            'nationality' => 'Indian'
        ]);

        DB::table('customers')->insert([
            'title' => '1',
            'name' => 'Joy',
            'spouse' => '',
            'birthday' => '1993-08-06',
            'anniversary' => '1993-08-06',
            'address' => $faker->address,
            'phone' => '',
            'mobile' => '9715681254',
            'fax' => '',
            'email' => '',
            'city' => 'Pune',
            'nationality' => 'Indian'
        ]);
       
    }
}
