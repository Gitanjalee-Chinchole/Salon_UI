<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEmployeeWorkingtime extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('employee_workingtimes', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('employeeId');
        $table->time('start_time');
        $table->time('end_time');
        $table->boolean('mon')->nullable();
        $table->boolean('tue')->nullable();
        $table->boolean('wed')->nullable();
        $table->boolean('thu')->nullable();
        $table->boolean('fri')->nullable();
        $table->boolean('sat')->nullable();
        $table->boolean('sun')->nullable();
        $table->foreign('employeeId')->references('id')->on('employees');
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
        Schema::dropIfExists('employee_workingtimes');
    }
}
