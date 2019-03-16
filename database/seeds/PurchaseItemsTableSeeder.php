<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PurchaseItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker\Factory::create();
        // PurchaseOrderItems::truncate();
        // And now, let's create a few units in our database:
        DB::table('purchase_items')->truncate();
        for ($i = 0; $i < 2; $i++) {
            DB::table('purchase_items')->insert([
            	'itemId'=>1,
            	'unitId'=>1,
            	'purchaseId'=>1,
            	'quantity'=>5,
                'cp_vat'=>5.00,
            	'total_amount'=>250,
            	'mrp'=>100,
            	'rate'=>50,
            	'created_at' => Carbon::now(),
        		'updated_at' => Carbon::now()
        		 ]);
    }
    }
}
