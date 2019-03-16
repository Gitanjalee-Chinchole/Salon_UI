<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePurchaseReturnItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('purchase_return_items', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('itemId');
            $table->integer('unitId');
            $table->integer('purchaseRId');
            $table->double('quantity');
            $table->float('tax_rate');
            $table->float('toatal_tax');
            $table->float('discount_rate')->nullable();
            $table->float('total_discount')->nullable();
            $table->float('total_amount');
            $table->float('mrp');
            $table->float('rate');
            $table->timestamps();
            $table->foreign('itemId')
            ->references('id')
            ->on('items');
            $table->foreign('unitId')
            ->references('id')
            ->on('units');
            $table->foreign('purchaseRId')
            ->references('id')
            ->on('purchase_returns');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('purchase_return_items');
    }
}
