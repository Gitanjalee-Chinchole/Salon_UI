<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ItemIngredient extends Model
{
    //
    protected $fillable = ['item','ingredient','quantity'];

    public function ingredientItem()
    {
        return $this->hasOne('App\Item','id','ingredient');
        
    }
    
}
