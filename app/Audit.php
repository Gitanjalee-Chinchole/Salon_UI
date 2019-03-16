<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Audit extends Model
{
    protected $fillable = array("record_id","type","remark","user_id");

	public function _user(){
		return $this->hasOne("App\User","id","user_id");
	}
}
