<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\PurchaseOrderItems;

class PurchaseOrderItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
       $faker = Faker\Factory::create();
       DB::table('purchase_order_items')->truncate();
        // And now, let's create a few units in our database:
        for ($i = 0; $i < 2; $i++) {
            DB::table('purchase_order_items')->insert([
            	'itemId'=>1,
            	'quantity'=>5,
            	'purchase_order_id'=>1,
            	'created_at' => Carbon::now(),
        		'updated_at' => Carbon::now()
        		 ]);
    }
    }
}
