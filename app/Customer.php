<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = ['title','name','spouse','birthday','anniversary','address','phone','mobile','fax','email','city','nationality'];

     public function assignPackage()
    {
        return $this->hasMany('App\CustomerPackage','customerId','id');
    }
}
