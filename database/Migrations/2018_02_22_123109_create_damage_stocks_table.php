<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDamageStocksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('damage_stocks', function (Blueprint $table) {
            $table->increments('id');
             $table->integer('type')
            ->comment('0 - Damage , 1 - Expiry')
            ->default(0);
             $table->date("slip_date");
            $table->integer('enterd_by');
            $table->foreign("enterd_by")
            ->references("users")
            ->on("id");

            $table->double('approx_value_of');
             $table->double('approx_value_of_cp')->nullable();
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
        Schema::dropIfExists('damage_stocks');
    }
}
