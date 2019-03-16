<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            UnitTableSeeder::class,
            CategoryTableSeeder::class,
            SuppliersTableSeeder::class,
            RoleTableSeeder::class,
            ItemsTableSeeder::class,
            ItemIngredientTableSeeder::class,
            UserTableSeeder::class,
            CustomerTableSeeder::class,
            OpeningStockTableSeeder::class,
            EmployeeTableSeeder::class,
            EmployeeServiceCommissionTableSeeder::class,
            PackageSetupSeeder::class,
            PackageServiceSeeder::class,
            CustomerPackageSeeder::class,
            CustomerPackageDetailSeeder::class,
            PurchaseOrderTableSeeder::class,
            PurchaseOrderItemsTableSeeder::class,
           // AppointementTableSeeder::class,
           // AppointementDetailsTableSeeder::class,
            PurchaseTableSeeder::class,
            PurchaseItemsTableSeeder::class,
            EmployeeWorkingTimeTableSeeder::class,
            ]);
    }
}
