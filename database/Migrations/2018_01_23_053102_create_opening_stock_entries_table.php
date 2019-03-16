<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOpeningStockEntriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('opening_stocks', function (Blueprint $table) {
            $table->increments('id');
            $table->dateTime("open_stock_date");
            
            $table->integer("itemId");
            $table->foreign('itemId')
                ->references('id')
                ->on('items');

            $table->double("openingStock");
            $table->integer("unitId");
            $table->foreign('unitId')
                ->references('id')
                ->on('units');
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
        Schema::dropIfExists('opening_stock');
    }
}
