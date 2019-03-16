<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePurchaseReturnsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('purchase_returns', function (Blueprint $table) {
            $table->increments('id');
            $table->date('return_date');
            $table->integer('supplierId');
            $table->integer('purchaseId')->nullable();
            $table->integer('supplier_bill_no');
            $table->date('supplier_bill_date');
            $table->string('purchase_mode');
            $table->integer('return_through');
            $table->float('sub_total');
            $table->float('discount_amount')->nullable();
            $table->float('extra_discount')->nullable();
            $table->float('bill_amount');
            $table->float('vat_amount');
            $table->foreign('supplierId')
            ->references('id')
            ->on('suppliers');
            $table->foreign('purchaseId')
            ->references('id')
            ->on('purchases');
            $table->foreign('return_through')
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
        Schema::dropIfExists('purchase_returns');
    }
}
