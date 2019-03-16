<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePurchaseItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('itemId');
            $table->integer('unitId');
            $table->integer('purchaseId');
            $table->double('quantity');
            $table->float('cp_vat');
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
            $table->foreign('purchaseId')
            ->references('id')
            ->on('purchase');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('purchase_items');
    }
}
