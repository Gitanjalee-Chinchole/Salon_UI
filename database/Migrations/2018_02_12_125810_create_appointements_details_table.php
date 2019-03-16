<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAppointementsDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('appointement_details', function (Blueprint $table) {
            $table->increments('id');

            $table->integer('itemId');
            $table->foreign('itemId')
            ->references('id')
            ->on('items');
            
            $table->integer('appointementId');
            $table->foreign('appointementId')
            ->references('id')
            ->on('appointements');

            $table->dateTime('started_on')->nullable();
            $table->dateTime('end_on')->nullable();
            $table->integer("serviceStylistId")->nullable();;
            $table->foreign('serviceStylistId')
            ->references('id')
            ->on('employees');
            
            $table->string('status')->nullable();
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
        Schema::dropIfExists('appointements_details');
    }
}
