<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $table = 'purchases';

    protected $fillable = [
        'mrn_date','supplierId','poId','supplier_bill_no','supplier_bill_date','purchase_mode','received_by','sub_total','discount_amount','extra_discount','bill_amount', 'vat_amount'
    ];

    public function employees()
    {
        return $this->hasOne('App\Employee','id','received_by');
    }

    public function supplier()
    {
    	return $this->hasOne('App\Supplier','id','supplierId');
    }

        public function purchaseOrder()
    {
    	return $this->hasOne('App\PurchaseOrder','id','poId');
    }

    public function purchaseItems()
    {
    	return $this->hasMany('App\PurchaseItems', 'purchaseId','id');
    }
}
