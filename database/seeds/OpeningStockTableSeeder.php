<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\OpeningStock;

class OpeningStockTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('opening_stocks')->truncate();
        $faker = Faker\Factory::create();
        // for ($i = 0; $i < 10; $i++) {
        // DB::table('opening_stocks')->insert([
        //     "open_stock_date" => $faker->date($format = 'Y-m-d', $max = 'now'),
        //     "itemId" => random_int(\DB::table('items')->min('id'), \DB::table('items')->max('id')),
        //     "openingStock" => $faker->numberBetween(100,3000),
        //     "unitId" => random_int(\DB::table('units')->min('id'), \DB::table('units')->max('id'))
        // ]);
        // }
    }
}
