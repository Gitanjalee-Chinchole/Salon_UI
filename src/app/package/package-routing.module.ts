
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CustomerComponent } from '../customer/customer.component';
import { EmployeeComponent } from '../employee/employee.component';
import { UnitComponent } from '../unit/unit.component';
import { SupplierComponent } from '../supplier/supplier.component';
import { CategoryComponent } from '../category/category.component';
import { UserComponent } from '../user/user.component';
import { OpeningStockComponent } from '../openingStock/openingStock.component';
import { ItemComponent } from '../item/item.component';
import { PackageSetupComponent } from './package-setup/package-setup.component';
import { PackageComponent } from './package.component';
import { PackageAssignmentComponent } from './package-assignment/package-assignment.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'package',
                component: PackageComponent,
                children: [
                    {
                        path: 'package_setup',
                        component: PackageSetupComponent
                    },
                    {
                        path: 'package_assignment',
                        component: PackageAssignmentComponent
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class PackageRoutingModule { }
