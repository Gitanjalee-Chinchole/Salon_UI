<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Item;

class Category extends Model
{

    protected $fillable = ['categorie', 'parent_category'];


    public function items()
    {
      return $this->belongsTo('App\Item','id','category')->withDefault();
    }
     public function parent_cat()
    {
      return $this->belongsTo('App\Category','parent_category','id')->withDefault();
    }
     public function parentCategory(){
    	return $this->hasOne('App\Category',"id", "parent_category");
    }
}
