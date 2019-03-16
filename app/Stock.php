<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
  protected $fillable = ["item_id", "type", "type_id","stock", "date"];

//   protected $dates = array(
// 		'date'
// 		);

	// public function setDateAttribute($value){
	// 	if($value!=null){
	// 		$this->attributes["date"] =  Carbon::parse($value);
	// 	}else{
	// 		$this->attributes["date"] = $value;
	// 	}
	// }

	// public function getDateAttribute($value)
	// {
	// 	if($value!=null){
	// 		return Carbon::parse($value)->format('m/d/Y');
	// 	}else{
	// 		return $value;
	// 	}
		
	// }

  public function item(){
		return $this->hasOne("App\Item", "id", "item_id");
	}
}
