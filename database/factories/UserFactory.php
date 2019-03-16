<?php

use Faker\Generator as Faker;
use Carbon\Carbon;
/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| This directory should contain each of the model factory definitions for
| your application. Factories provide a convenient way to generate new
| model instances for testing / seeding your application's database.
|
*/

// $factory->define(App\User::class, function (Faker $faker) {
//     static $password;

//     return [
//         'username' => str_random(10),
//         'email' => $faker->unique()->safeEmail,
//         'password' => $password ?: $password = bcrypt('secret'),
//         'remember_token' => str_random(10),
//     ];
// });

$factory->define(App\Role::class, function (Faker $faker) {
    static $password;

    return [
        'role' => $faker->jobTitle,
    ];
});
 $factory->define(App\Supplier::class, function (Faker $faker) {
        return [
            'company_name' => $faker->company,
            'type' => $faker->jobTitle,
            'title' => $faker->title,
            'email' => $faker->safeEmail,
        ];
});

$factory->define(App\User::class, function (Faker $faker) {
 static $password;
 return [ 
              'username' => $faker->name,
              'email'=>$faker->email,
              'password' => $password ?: $password = bcrypt('secret'),
              'remember_token' => str_random(10),
              'role'=> random_int(\DB::table('roles')->min('id'), \DB::table('roles')->max('id')),
              'floor' => 'Floor'." ".random_int(1, 3),
        ];
         });
         
$factory->define(App\Supplier::class, function (Faker $faker) {
        return [
            'company_name' => $faker->company,
            'type' => $faker->jobTitle,
            'title' => $faker->title,
            'email' => $faker->safeEmail,
        ];
});