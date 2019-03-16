<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateItemIngredientsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_ingredients', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('item');
            $table->integer('ingredient');
            $table->string('quantity');
            $table->timestamps();
            $table->foreign('item')
            ->references('id')
            ->on('items');
            $table->foreign('ingredient')
            ->references('id')
            ->on('items');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('item_ingredients');
    }
}
