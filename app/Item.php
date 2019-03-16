<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Unit;

class Item extends Model
{
    protected $fillable = ['productCode','serialNumber','category','barcode','itemName','itemType','itemNameArabic','costPrice','salePrice','sp_vat','cp_vat','description','unit','stock','min','max','stylistCommRate','serviceTime','expiry_date','image'];
  
    public function unit()
    {
        return $this->hasOne('App\Unit','id','unit')->withDefault();
    }

    public function category()
    {
        return $this->hasOne('App\Category','id','category');
        
    }

    public function ingredients(){
        return $this->hasMany('App\ItemIngredient','item','id');
    }

    protected $dates = ['deleted_at'];
}
