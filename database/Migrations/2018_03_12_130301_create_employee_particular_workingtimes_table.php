<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEmployeeParticularWorkingtimesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('employee_particular_workingtimes', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('employeeId');
            $table->date('particular_date')->nullable();
            $table->time('particularstart_time')->nullable();
            $table->time('particularend_time')->nullable();
            $table->string('comment')->nullable();
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
        Schema::dropIfExists('employee_particular_workingtimes');
    }
}
