<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Appointement extends Model
{
    protected $fillable = ['appointement_date','appointement_end_on','customerId','confirmed_by','stylistId','status','totalCost'];
    protected $dates = array('appointement_date');
    public function setAppointementDateAttribute($value){
		$this->attributes["appointement_date"] =  Carbon::parse($value);
    }
    public function customer(){
        return $this->hasOne('App\Customer','id','customerId');
    }
    
    public function stylist(){
        return $this->hasOne('App\Employee','id','stylistId');
    }

    public function services(){
        return $this->hasMany('App\AppointementDetails','appointementId','id');
    }
}
