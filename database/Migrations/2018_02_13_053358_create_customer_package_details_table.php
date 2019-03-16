<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCustomerPackageDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customer_package_details', function (Blueprint $table) {
           $table->increments('id');
             $table->integer('custPackageId')->nullable();
            $table->integer('itemId')->nullable();
            $table->integer('availed_qty')->nullable();
             $table->integer('balance_qty')->nullable();
              $table->string('pkgId')->nullable();
            $table->timestamps();
            $table->foreign('custPackageId')
            ->references('id')
            ->on('customer_packages');
            $table->foreign('itemId')
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
        Schema::dropIfExists('customer_package_details');
    }
}
