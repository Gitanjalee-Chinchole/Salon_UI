<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDamageStockItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('damage_stock_items', function (Blueprint $table) {
            $table->increments('id');
             $table->integer('damage_order_id');
            $table->integer('item_id');
            $table->double('quantity')
            ;
            $table->double('rate');
            $table->double('amt');
            $table->string('remark'); 

            $table->foreign("damage_order_id")
            ->references("damage_stocks")
            ->on("id");

            $table->foreign("item_id")
            ->references("items")
            ->on("id");
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
        Schema::dropIfExists('damage_stock_items');
    }
}
