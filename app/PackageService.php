<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Item;

class PackageService extends Model
{
     protected $fillable = ['packageId','itemId','quantity','rate','amount'];
     
     public function packageServiceItem()
    {
        return $this->hasOne('App\Item','id','itemId');      
    }
}
