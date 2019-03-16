<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEmployeeTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('employees', function (Blueprint $table) {
             $table->increments('id');
            $table->string('name')->nullable();
            $table->string('parentName')->nullable();
            $table->string('gander')->nullable();
            $table->string('mobile')->nullable();
            $table->string('email')->nullable();
            $table->dateTime("birthday")->nullable();
            $table->dateTime("dateOfJoining")->nullable();
            $table->string('department')->nullable();
            $table->string('position')->nullable(); 
            $table->longText('pAddress')->nullable(); 
            $table->longText('rAddress')->nullable(); 
            $table->boolean('active')->nullable();
            $table->boolean('stylist')->nullable();
            $table->string("image")->nullable();
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
        Schema::dropIfExists('employees');
    }
}
