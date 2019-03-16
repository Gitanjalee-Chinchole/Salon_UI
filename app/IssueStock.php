<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class IssueStock extends Model
{
    protected $fillable = array('slip_date', 'approx_value_of', 'issue_to');

    public function issueItemList(){
		return $this->hasMany('App\IssueStockItem',"issue_stocks_id","id");
    }
    public function employees(){
		return $this->hasOne('App\Employee',"id","issue_to");
	}

}
