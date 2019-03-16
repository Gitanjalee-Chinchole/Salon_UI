<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEmployeeServiceCommissionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('employee_service_commissions', function (Blueprint $table) {
             $table->increments('id');
            $table->integer('employeeId');
            $table->integer('itemId');
            $table->string('comm_rate');
            $table->timestamps();
            $table->foreign('employeeId')
            ->references('id')
            ->on('employees');
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
        Schema::dropIfExists('employee_service_commissions');
    }
}
