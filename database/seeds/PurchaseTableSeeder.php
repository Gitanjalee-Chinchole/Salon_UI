<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Purchase;

class PurchaseTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker\Factory::create();
        Purchase::truncate();
        // And now, let's create a few units in our database:
        DB::table('purchases')->truncate();
        for ($i = 0; $i < 1; $i++) {
            DB::table('purchases')->insert([
            	'mrn_date'=>'2018-02-08',
            	'supplierId'=>1,
                'poId' =>1,
            	'supplier_bill_no'=>1212,
            	'supplier_bill_date'=>'2018-02-10',
            	'purchase_mode'=>'Cash',
            	'received_by'=>1,
            	'sub_total'=>240,
                'vat_amount'=>10,
            	'bill_amount'=>250,
            	'created_at' => Carbon::now(),
        		'updated_at' => Carbon::now()
        		 ]);
    }
    }
}
