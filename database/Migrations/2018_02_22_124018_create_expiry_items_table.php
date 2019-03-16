<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateExpiryItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('expiry_items', function (Blueprint $table) {
            $table->increments('id');
             $table->integer('expiry_order_id');
            $table->integer('mrn_no');
            $table->integer('item_id');
            $table->integer('quantity');
            $table->double('rate');
            $table->double('amt');
            $table->string('remark'); 

            $table->foreign("expiry_order_id")
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
        Schema::dropIfExists('expiry_items');
    }
}
