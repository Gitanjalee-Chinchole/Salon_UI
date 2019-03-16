<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Item;

class ItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker\Factory::create();
        Item::truncate();
        // And now, let's create a few units in our database:
        for ($i = 0; $i < 5; $i++) {
            DB::table('items')->insert([
                'productCode'=> $faker->bothify("??#########"),
                'category'=> 2,
                'barcode'=> $faker->isbn13,
                'itemName'=> $faker->word,
                'itemType'=>'Service',
                'itemNameArabic'=>'يتحدث',
                'costPrice'=> $faker->randomFloat($nbMaxDecimals = NULL, $min = 0, $max = 100),
                'salePrice'=> $faker->randomFloat($nbMaxDecimals = NULL, $min = 0, $max = 100),
                'description'=> $faker->sentence,
                'unit'=> random_int(\DB::table('units')->min('id'), \DB::table('units')->max('id')),
                'stock'=> 0,
                'min'=> $faker->numberBetween(0, 10),
                'max'=> $faker->numberBetween(15,100),
                'expiry_date'=> $faker->date($format = 'Y-m-d', $max = '+30 months'),
                'image'=> $faker->imageUrl(150, 150 , 'food'),
                'serviceTime' => "00:10:00",
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now() 
            ]);
        }
    }
}
