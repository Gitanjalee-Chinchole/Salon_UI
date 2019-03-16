<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DamageStockItem extends Model
{
    protected $fillable = array(
		"damage_order_id", "item_id", "quantity","rate","amt","remark"
		);

	public function items (){
		return $this->hasOne("App\Item", "id" , "item_id");
	}
}
