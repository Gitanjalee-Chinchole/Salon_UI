<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PurchaseItems extends Model
{
	protected $table = 'purchase_items';
    protected $fillable = ['itemId','unitId','purchaseId','quantity','discount_rate','total_discount','total_amount','mrp','rate','cp_vat'];

     public function item()
    {
    	return $this->hasOne('App\Item','id','itemId');
    }

    public function units()
    {
    	return $this->hasOne('App\Unit','id','unitId');
    }
}
