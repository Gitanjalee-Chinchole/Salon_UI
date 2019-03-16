<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Supplier;
use App\PurchaseOrderItems;

class PurchaseOrder extends Model
{
    protected $table = 'purchase_order';

    protected $fillable = [
        'purchase_order_date','supplierId','status'
    ];

    public function supplier()
    {
    	return $this->hasOne('App\Supplier','id','supplierId');
    }

    public function purchaseOrderItems()
    {
    	return $this->hasMany('App\PurchaseOrderItems', 'purchase_order_id','id');
    }

     
}
