<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\User;

class Role extends Model
{
    protected $fillable = ['role'];

       public function users(){
       	return $this->hasMany('App\User','role','id');
       }
}
