<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePurchaseTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->increments('id');
            $table->date('mrn_date');
            $table->integer('supplierId');
            $table->integer('poId')->nullable();
            $table->integer('supplier_bill_no');
            $table->date('supplier_bill_date');
            $table->string('purchase_mode');
            $table->integer('received_by');
            $table->float('sub_total');
            $table->float('discount_amount')->nullable();
            $table->float('extra_discount')->nullable();
            $table->float('bill_amount');
            $table->float('vat_amount');
            $table->foreign('supplierId')
            ->references('id')
            ->on('suppliers');
            $table->foreign('poId')
            ->references('id')
            ->on('purchase_order');
            $table->foreign('received_by')
            ->references('id')
            ->on('employees');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('purchases');
    }
}
