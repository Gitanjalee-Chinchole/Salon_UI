<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\PurchaseOrder;

class PurchaseOrderTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker\Factory::create();
        PurchaseOrder::truncate();
        // And now, let's create a few units in our database:
        DB::table('purchase_order')->truncate();
        for ($i = 0; $i < 1; $i++) {
            DB::table('purchase_order')->insert([
            	'purchase_order_date' => '2018-02-08',
            	'supplierId' => 1,
            	'status' => 'Pending',
            	'created_at' => Carbon::now(),
        		'updated_at' => Carbon::now()
        		 ]);
        }
    }
}
