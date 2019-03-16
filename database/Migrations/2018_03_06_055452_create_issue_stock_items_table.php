<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateIssueStockItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('issue_stock_items', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('issue_stocks_id');
            $table->integer('item_id');
            $table->double('quantity');
            $table->double('rate');
             $table->double('amt');
            $table->string('remark')->nullable(); 
 
            $table->foreign("issue_stocks_id")
            ->references("issue_stocks")
            ->on("id");
 
            $table->foreign("item_id")
            ->references("items")
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
        Schema::dropIfExists('issue_stock_items');
    }
}
