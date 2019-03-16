<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class IssueStockItem extends Model
{
    protected $fillable = array(
		"issue_stocks_id", "item_id", "quantity","rate","amt","remark"
		);

	public function items (){
		return $this->hasOne("App\Item", "id" , "item_id");
	}
}
