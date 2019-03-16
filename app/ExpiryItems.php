<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ExpiryItems extends Model
{
    protected $fillable = array(
		"expiry_order_id","mrn_no", "item_id", "quantity","rate","amt","remark"
		);

	public function items (){
		return $this->hasOne("App\Item", "id" , "item_id");
	}
}
