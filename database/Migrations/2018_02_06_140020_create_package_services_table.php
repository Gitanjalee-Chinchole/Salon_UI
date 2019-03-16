<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePackageServicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('package_services', function (Blueprint $table) {
            $table->increments('id');
             $table->integer('packageId');
            $table->integer('itemId');
            $table->string('quantity');
             $table->string('rate');
              $table->string('amount');
            $table->timestamps();
            $table->foreign('packageId')
            ->references('id')
            ->on('package_setups');
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
        Schema::dropIfExists('package_services');
    }
}
