<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSuppliersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('type')->nullable();
             $table->integer('title')
            ->default(null)
            ->comment("1 = Mr. 2= Ms.  3= Mrs.")->nullable();
            $table->string('company_name');
            $table->string('contact')->nullable();
            $table->longtext('address')->nullable();
            $table->string('office_no')->nullable();
            $table->string('mobile_no')->nullable();
            $table->string('fax')->nullable();
            $table->string('email')->nullable();
            $table->string('city')->nullable(); 
            $table->string('ecc_no')->nullable();
            $table->string('cst_no')->nullable();
            $table->string('range_no')->nullable();
            $table->string('division')->nullable();
            $table->string('comm')->nullable();
            $table->string('pan_no')->nullable();
            $table->string('tin_no')->nullable();
            $table->string('account_grp')->nullable();
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
        Schema::dropIfExists('suppliers');
    }
}
