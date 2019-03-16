<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OpeningStock extends Model
{
   protected $fillable = [ 'open_stock_date' , 'itemId' , 'openingStock', 'unitId'];
   
   protected $table = 'opening_stocks';
   
   public function unit()
    {
        return $this->hasOne('App\Unit','id','unitId')->withDefault();
    }
    
    public function item()
    {
        return $this->hasOne('App\Item','id','itemId')->withDefault();
    }
    
    // public function category()
    // {
    //     return $this->hasOne('App\Category','id','category');
        
    // }
    
    public function parentcategory()
    {
        return $this->hasOne('App\Category','id','parent_category');
        
    }
}
