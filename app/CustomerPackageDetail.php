<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CustomerPackageDetail extends Model
{
    protected $fillable = ['custPackageId','itemId','availed_qty','balance_qty','pkgId'];
      public function packageItem()
    {
        return $this->hasOne('App\Item','id','itemId');      
    }
}
