<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\ItemIngredient;
class ItemIngredientTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        itemingredient::truncate();
        DB::table('item_ingredients')->insert(array(
            array('item' => 1 , 'ingredient' => 5 , 'quantity' => 5 ,'created_at' => Carbon::now(),'updated_at' => Carbon::now())
            ));
    }
}
