
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StarterComponent } from './starter.component';
import { CustomerComponent } from '../customer/customer.component';
import { EmployeeComponent } from '../employee/employee.component';
import { UnitComponent } from '../unit/unit.component';
import { SupplierComponent } from '../supplier/supplier.component';
import { CategoryComponent } from '../category/category.component';
import { UserComponent } from '../user/user.component';
import { OpeningStockComponent } from '../openingStock/openingStock.component';
import { ItemComponent } from '../item/item.component';
import { ScheduleEmployeeComponent } from '../schedule-employee/schedule-employee.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'master',
                component: StarterComponent,
                children: [
                    {
                        path: 'customer',
                        component: CustomerComponent
                    },
                    {
                        path: 'employee',
                        component: EmployeeComponent
                    },
                    {
                        path: 'unit',
                        component: UnitComponent
                    },
                    {
                        path: 'supplier',
                        component: SupplierComponent
                    },
                    {
                        path: 'opening_stock',
                        component: OpeningStockComponent
                    },
                    {
                        path: 'item',
                        component: ItemComponent
                    },
                    {
                        path: 'category',
                        component: CategoryComponent
                    },
                    {
                        path: 'user',
                        component: UserComponent
                    },
                    {
                        path: 'employee-schedule',
                        component: ScheduleEmployeeComponent
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class StarterRoutingModule { }
