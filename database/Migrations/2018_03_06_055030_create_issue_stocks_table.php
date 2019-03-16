<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateIssueStocksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('issue_stocks', function (Blueprint $table) {
            $table->increments('id');
            $table->date("slip_date");
            $table->double('approx_value_of');
            $table->integer('issue_to');
            $table->foreign("issue_to")
            ->references("employees")
            ->on("id");
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
        Schema::dropIfExists('issue_stocks');
    }
}
