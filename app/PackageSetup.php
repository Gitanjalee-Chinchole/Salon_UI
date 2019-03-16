<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\PackageServicePackageService;

class PackageSetup extends Model
{
    protected $fillable = ['packageName','validFor','packageCommission','totalCost'];
    
     public function packageServices(){
        return $this->hasMany('App\PackageService','packageId','id');
    }
}
