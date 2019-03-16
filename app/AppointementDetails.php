<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AppointementDetails extends Model
{
    protected $fillable = ['itemId','appointementId','started_on','end_on','serviceStylistId','status'];
    protected $dates = array('started_on','end_on');
    public function setStartedOnAttribute($value){
		$this->attributes["started_on"] =  Carbon::parse($value);
    }
    public function setEndOnAttribute($value){
		$this->attributes["end_on"] =  Carbon::parse($value);
	}
    public function service()
    {
       return $this->hasOne('App\Item','id','itemId');      
    }
}
