<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
//use Kyslik\ColumnSortable\Sortable;
class Supplier extends Model
{
  //  use Sortable;
    protected $fillable = ['type','title','company_name','contact','address','office_no','mobile_no','fax','email','city','ecc_no','cst_no','range_no','division','comm','pan_no','tin_no','account_grp'];
    protected $dates = ['deleted_at'];
}
