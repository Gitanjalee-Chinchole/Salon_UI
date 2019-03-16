<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\PurchaseOrder;

class PurchaseOrderItems extends Model
{
	protected $table = 'purchase_order_items';

	protected $fillable = [
        'itemId','quantity','purchase_order_id',
    ];

    public function item()
    {
    	return $this->hasOne('App\Item','id','itemId');
    }
}
