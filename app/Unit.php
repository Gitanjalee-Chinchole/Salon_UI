<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Item;

class Unit extends Model
{
    protected $fillable = ['unit'];
     
    public function items(){
        return $this->belongsTo('App\Item','id')->withDefault();
    }
}
