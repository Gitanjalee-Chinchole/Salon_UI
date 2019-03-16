<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCustomersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->increments('id');
             /** 1 = Mr. 2= Ms.  3= Mrs.  */
            $table->string("title")
                    ->default("1")
                    ->comment("1 = Mr. 2= Ms.  3= Mrs.")->nullable();

            $table->string("name");

            $table->string("spouse")
                    ->nullable();

            $table->dateTime("birthday")->nullable();

            $table->dateTime("anniversary")->nullable();

            $table->longText("address")->nullable();

            $table->string("phone")
                    ->nullable();

            $table->string("mobile")
                    ->nullable();

            $table->string("fax")
                    ->nullable();

            $table->string("email")->nullable();

            $table->string("city")->nullable();
             $table->string("nationality")->nullable();
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
        Schema::dropIfExists('customers');
    }
}
