<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCustomerPackagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customer_packages', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('customerId')->nullable();
            $table->integer('packageId')->nullable();
            $table->integer('stylistId')->nullable();
             $table->dateTime('validFrom')->nullable();
              $table->dateTime('validTo')->nullable();
               $table->double('advanceAmount')->nullable();
            $table->timestamps();
            $table->foreign('packageId')
            ->references('id')
            ->on('package_setups');
            $table->foreign('stylistId')
            ->references('id')
            ->on('employees');
             $table->foreign('customerId')
            ->references('id')
            ->on('customers');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('customer_packages');
    }
}
