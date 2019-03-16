<?php

use Illuminate\Database\Seeder;

class PurchaseReturnItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
         $faker = Faker\Factory::create();
        PurchaseReturnItems::truncate();
        // And now, let's create a few units in our database:
        DB::table('purchase_return_items')->truncate();
        for ($i = 0; $i < 1; $i++) {
            DB::table('purchase_return_items')->insert([
            	'itemId'=>1,
            	'unitId'=>1,
            	'purchaseRId'=>1,
            	'quantity'=>5,
                'cp_vat'=>5.00,
            	'total_amount'=>250,
            	'total_vat'=>11.9048,
            	'mrp'=>100,
            	'rate'=>50,
            	'created_at' => Carbon::now(),
        		'updated_at' => Carbon::now()
        		 ]);
    }
    }
}
