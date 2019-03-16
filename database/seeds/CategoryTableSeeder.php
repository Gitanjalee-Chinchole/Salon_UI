<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Category;

class CategoryTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Category::truncate();
        $faker = Faker\Factory::create();
        
            DB::table('categories')->insert(
                [
                'categorie' => 'General',
                'parent_category' => 0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now() 
            ]);
            DB::table('categories')->insert([
                'categorie' => 'Test',
                'parent_category' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now() 
                ]);
        
    }
}
