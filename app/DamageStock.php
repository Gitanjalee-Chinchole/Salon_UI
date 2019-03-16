<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DamageStock extends Model
{
   protected $fillable = ['slip_date','enterd_by','approx_value_of', 'approx_value_of_cp','type'];

  // protected $dates = array('slip_date');

	// public function setSlipDateAttribute($value){
	// 	$this->attributes["slip_date"] =  Carbon::parse($value);
	// }
	// public function getSlipDateAttribute($value)
	// {
	// 	return Carbon::parse($value)->format('m/d/Y');
	// }

	public function damageItemList(){
		return $this->hasMany('App\DamageStockItem',"damage_order_id","id");
	}

	public function expiryItemList(){
		return $this->hasMany('App\ExpiryItems',"expiry_order_id","id");
	}

	public function users(){
		return $this->hasOne('App\User',"id","enterd_by");
	}
}
