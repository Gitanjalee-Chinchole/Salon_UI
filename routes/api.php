<?php

use Illuminate\Http\Request;
use App\Unit;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
// Route::get('units', 'UnitsController@index');
// Route::get('units/{id}', 'UnitsController@show');
// Route::post('units', 'UnitsController@store');
// Route::put('units/{id}', 'UnitsController@update');
// Route::delete('units/{id}', 'UnitsController@delete');
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// Route::get('categorys/xls', array('middleware' => 'CORS', 'uses' => 'CategoryController@exportToXls'));

Route::post('login', 'Auth\LoginController@login');
Route::post('logout', 'Auth\LoginController@logout');
Route::post('register', 'Auth\RegisterController@register');

Route::get('categorys/xls', 'CategoryController@exportToXls');
Route::get('categorys', 'CategoryController@index');
Route::get('categorys/paginate', 'CategoryController@filterCategorys');
Route::get('categorys/parent/{id}', 'CategoryController@getByParentCat');
Route::get('categorys/{category}', 'CategoryController@show');
Route::post('categorys', 'CategoryController@store');
Route::put('categorys/{category}', 'CategoryController@update');
Route::delete('categorys/{category}', 'CategoryController@delete');

Route::get('units', 'UnitsController@index');
Route::get('units/paginate', 'UnitsController@filterUnits');
Route::get('units/{unit}', 'UnitsController@show');
Route::post('units', 'UnitsController@store');
Route::put('units/{unit}', 'UnitsController@update');
Route::delete('units/{id}', 'UnitsController@delete');

Route::get('common/lastId/{tableName?}', 'CommonController@get_autoIncremenetVal');

Route::get('items/search_name', 'ItemsController@searchItemName');
Route::get('items/{itemsPerPage}', 'ItemsController@index');
Route::post('importItems', 'ItemsController@importItems');
Route::get('items/edit/{item}', 'ItemsController@show');
Route::put('items/{item}', 'ItemsController@update');
Route::delete('items/{item}', 'ItemsController@delete');
Route::post('items', 'ItemsController@store');
Route::post('uploadImage', 'ItemsController@uploadImage');
// save excel items 
Route::post('saveitems', 'ItemsController@saveitems');
Route::get('items/ingredients/search', 'ItemsController@search');
Route::get('user', 'UserController@index');
Route::post('items/xls/download', 'ItemsController@exportToXls');

/**
 	* Customer route
 	*/
Route::get('customers', 'CustomerController@index');
Route::get('customers/paginate', 'CustomerController@paginatecustomer');
Route::get('customers/edit/{customer}', 'CustomerController@edit');
Route::post('customers', 'CustomerController@store');
Route::put('customers/{customer}', 'CustomerController@update');
Route::delete('customers/{customer}', 'CustomerController@delete');

Route::get('opening_stocks', 'OpeningStockController@index');
Route::get('opening_stocks/filter', 'OpeningStockController@filter');
Route::get('opening_stocks/edit/{opening_stock}', 'OpeningStockController@edit');
Route::post('opening_stocks', 'OpeningStockController@store');
Route::put('opening_stocks/{opening_stock}', 'OpeningStockController@update');
Route::delete('opening_stocks/{opening_stock}', 'OpeningStockController@delete');
Route::delete('opening_stocks/{opening_stock}', 'OpeningStockController@delete');
Route::post('opening_stocks/uploadFile', 'OpeningStockController@uploadFile');

Route::get('employees/workingtimes', 'EmployeeWorkingTimeController@index');
Route::get('employees/workingtimes/paginate', 'EmployeeWorkingTimeController@paginateindex');
Route::get('employees/workingtimes/{id}', 'EmployeeWorkingTimeController@show');
Route::post('employees/workingtimes', 'EmployeeWorkingTimeController@store');
Route::put('employees/workingtimes/{id}', 'EmployeeWorkingTimeController@update');
Route::delete('employees/workingtimes/{id}', 'EmployeeWorkingTimeController@delete');
// Route::group(['middleware' => 'auth:api'], function() {
//     Route::get('units', 'UnitsController@index');
//     Route::get('units/{unit}', 'UnitsController@show');
//     Route::post('units', 'UnitsController@store');
//     Route::put('units/{unit}', 'UnitsController@update');
//     Route::delete('units/{unit}', 'UnitsController@delete');
// });

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });
Route::get('suppliers/paginate','SupplierController@filter');
Route::get('suppliers','SupplierController@index');
Route::get('suppliers/edit/{id}', 'SupplierController@show');
Route::get('retrive','SupplierController@retrive');
Route::post('suppliers','SupplierController@store');
Route::post('restore/{id}','SupplierController@restore');
Route::put('suppliers/{id}','SupplierController@update');
Route::delete('suppliers/{id}','SupplierController@delete');

Route::get('employees', 'EmployeeController@index');
Route::get('employees/paginate', 'EmployeeController@paginateemployee');
Route::get('employees/stylists', 'EmployeeController@stylist');
Route::get('employees/edit/{employee}', 'EmployeeController@show');
Route::get('employees/getAvailableWorkingEmployees/{date}', 'EmployeeController@getAvailableWorkingEmployees');
Route::post('employees', 'EmployeeController@store');
Route::put('employees/{item}', 'EmployeeController@update');
Route::delete('employees/{id}', 'EmployeeController@delete');





Route::get('roles/paginate','RoleController@filter');
Route::get('roles','RoleController@index');
Route::get('roles/{id}', 'RoleController@show');
Route::get('retrive','RoleController@retrive');
Route::post('roles','RoleController@store');
Route::post('restore/{id}','RoleController@restore');
Route::put('roles/{id}','RoleController@update');
Route::delete('roles/{id}','RoleController@delete');

Route::get('package_setups', 'PackageSetupController@index');
Route::get('package_setups/paginate', 'PackageSetupController@paginatePackage');
Route::get('package_setups/edit/{package}', 'PackageSetupController@show');
Route::post('package_setups', 'PackageSetupController@store');
Route::put('package_setups/{item}', 'PackageSetupController@update');
Route::delete('package_setups/{id}', 'PackageSetupController@delete');


Route::get('users/paginate','UserController@filter');
Route::get('users','UserController@index');
Route::get('users/{id}', 'UserController@show');
Route::get('users/retrive','UserController@retrive');
Route::post('users','UserController@store');
Route::post('restore/{id}','UserController@restore');
Route::put('users/{id}','UserController@update');
Route::delete('users/{id}','UserController@delete');

Route::get('purchase_order/paginate','PurchaseOrderController@filter');
Route::get('purchase_order','PurchaseOrderController@index');
Route::get('purchase_order/edit/{purchase_order}', 'PurchaseOrderController@show');
Route::post('purchase_order','PurchaseOrderController@store');
Route::put('purchase_order/{purchase_order}','PurchaseOrderController@update');
Route::delete('purchase_order/{id}','PurchaseOrderController@delete');


Route::get('package_assignments', 'CustomerPackageController@index');
Route::get('package_assignments/paginate', 'CustomerPackageController@paginatePackageAssign');
Route::get('package_assignments/{id}', 'CustomerPackageController@customerById');
Route::post('package_assignments', 'CustomerPackageController@store');

Route::get('appointements/getbydate','AppointementController@appointementByDate');
Route::get('appointements', 'AppointementController@index');
Route::get('appointements/getbetweendates','AppointementController@getbetweendates');
Route::post('appointements', 'AppointementController@store');
Route::get('appointements/{id}', 'AppointementController@show');
Route::put('appointements/{id}','AppointementController@update');
Route::post('appointements/rebook','AppointementController@rebook');


Route::get('purchase/paginate','PurchaseController@filter');
Route::get('purchase','PurchaseController@index');
Route::get('purchase/edit/{purchase}','PurchaseController@show');
Route::post('purchase','PurchaseController@store');
Route::put('purchase/{purchase}','PurchaseController@update');
Route::delete('purchase/{id}','PurchaseController@delete');
Route::post('purchase/uploadItems','PurchaseController@uploadItems');

Route::get('damage_stocks', 'DamageStockController@index');
Route::get('damage_stocks/paginate', 'DamageStockController@damagStockPaginate');
Route::get('damage_stocks/edit/{id}', 'DamageStockController@edit');
Route::get('damage_stocks/getitems/{id}', 'DamageStockController@getItemsByMRN');
Route::post('damage_stocks', 'DamageStockController@store');
Route::put('damage_stocks/{id}', 'DamageStockController@update');
Route::delete('damage_stocks/{id}', 'DamageStockController@delete');

Route::get('issue_stocks', 'IssueStockController@index');
Route::get('issue_stocks/paginate', 'IssueStockController@issueStockPaginate');
Route::get('issue_stocks/edit/{id}', 'IssueStockController@edit');
Route::post('issue_stocks', 'IssueStockController@store');
Route::put('issue_stocks/{id}', 'IssueStockController@update');
Route::delete('issue_stocks/{id}', 'IssueStockController@delete');
