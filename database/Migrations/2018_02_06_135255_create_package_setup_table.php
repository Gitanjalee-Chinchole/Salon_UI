<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePackageSetupTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('package_setups', function (Blueprint $table) {
            $table->increments('id');
                $table->string("packageName")->nullable();
            $table->double("validFor")->nullable();
            $table->double("packageCommission")->nullable();
            $table->double("totalCost")->nullable();
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
        Schema::dropIfExists('package_setup');
    }
}
