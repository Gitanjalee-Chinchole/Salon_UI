<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAppointementsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('appointements', function (Blueprint $table) {
            $table->increments('id');
            $table->dateTime("appointement_date");
            $table->dateTime("appointement_end_on")->nullable();
            $table->integer("customerId");
            $table->foreign('customerId')
            ->references('id')
            ->on('customers');

            $table->string("confirmed_by")->nullable();
            
            $table->integer("stylistId");
            $table->foreign('stylistId')
            ->references('id')
            ->on('employees');

            $table->string("status");
            $table->double("totalCost");
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
        Schema::dropIfExists('appointements');
    }
}
