
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
import { StockComponent } from './stock.component';
import { PurchaseEntryComponent } from './purchase-entry/purchase-entry.component';
import { PurchaseReturnComponent } from './purchase-return/purchase-return.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { ExpiryStockComponent } from './expiry-stock/expiry-stock.component';
import { IssueItemStockComponent } from './issue-item-stock/issue-item-stock.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'stock',
                component: StockComponent,
                children: [
                    {
                        path: 'purchase_entrie',
                        component: PurchaseEntryComponent
                    },
                    {
                        path: 'purchase_return',
                        component: PurchaseReturnComponent
                    },
                    {
                        path: 'purchase_order',
                        component: PurchaseOrderComponent
                    },
                    {
                        path: 'expiry_stock',
                        component: ExpiryStockComponent
                    },
                    {
                        path: 'issue_item_stock',
                        component: IssueItemStockComponent
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class StockRoutingModule { }
