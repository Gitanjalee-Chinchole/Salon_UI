<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CustomerPackage extends Model
{
     protected $fillable = ['customerId','packageId','stylistId','validFrom','validTo','advanceAmount'];
     public function package()
    {
        return $this->hasOne('App\PackageSetup','id','packageId')->withDefault();
    }
     public function stylist()
    {
        return $this->hasOne('App\Employee','id','stylistId')->withDefault();
    }
      public function customer()
    {
        return $this->hasOne('App\Customer','id','customerId')->withDefault();
    }
    public function customerPkgDetail(){
        return $this->hasMany('App\CustomerPackageDetail','custPackageId','id');
    }
}
