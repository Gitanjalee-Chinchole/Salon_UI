<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateItemTableAddVatColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('items', function (Blueprint $table) {
            $table->float('sp_vat')
            ->default(0)
            ->after('salePrice')
            ->comment("%");
           $table->float('cp_vat')
            ->default(0)
            ->comment("%")
            ->after('sp_vat');
    });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('items', function($table) {
            $table->dropColumn("sp_vat");
            $table->dropColumn("cp_vat");
        });
    }
}
