<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStockTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('item_id');
            $table->foreign("item_id")
            ->references("items")
            ->on("id");
            $table->integer('type')
            ->comment(" 1=open stock 
                        2=purchase 
                        3=purchase_return 
                        4=issue 
                        5=damage 
                        6=billing
                        7=package
                        8=offer
                        9=billing return
                        10=expiry
                        ");
            $table->integer('type_id');
            $table->double('stock');
            $table->date("date");       
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
        Schema::dropIfExists('stock');
    }
}
