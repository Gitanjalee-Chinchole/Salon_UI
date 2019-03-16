<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('items', function (Blueprint $table) {
            $table->increments('id');
            $table->string('productCode')->nullable();
            $table->string('serialNumber')->nullable();
            $table->integer('category')->nullable();
            $table->string('barcode');
            $table->string('itemName');
            $table->string('itemType');
            $table->string('itemNameArabic')->nullable();
            $table->float('costPrice')->nullable();;
            $table->float('salePrice');
            $table->longText('description')->nullable();
            $table->integer('unit')->nullable();; 
            $table->double('stock'); 
            $table->integer('min')->nullable(); 
            $table->integer('max')->nullable();
            $table->double('stylistCommRate')->nullable();
            $table->time('serviceTime')->nullable(); 
            $table->date("expiry_date")->nullable();
            $table->string("image")->nullable();
            $table->timestamps();
            $table->foreign('category')
            ->references('id')
            ->on('categories');
            $table->foreign('unit')
            ->references('id')
            ->on('units');
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('items');
    }
}
