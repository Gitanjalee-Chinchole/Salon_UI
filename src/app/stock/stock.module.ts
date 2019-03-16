import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeComponent } from '../employee/employee.component';
import { CustomerModule } from '../customer/customer.module';
import { EmployeeModule } from '../employee/employee.module';
import { UnitComponent } from '../unit/unit.component';
import { Safe } from '../confirm/safehtml.component';
import { OpeningStockModule } from '../openingStock/openingStock.module';
import { ItemComponent } from '../item/item.component';
import { StockComponent } from './stock.component';
import { StockRoutingModule } from './stock-routing.module';
import { StarterComponent } from '../starter/starter.component';
import { LayoutModule } from '../layout/layout.module';
import { StarterHeaderComponent } from '../layout/starter-header/starter-header.component';
import { StarterLeftSideComponent } from '../layout/starter-left-side/starter-left-side.component';
import { StarterContentComponent } from '../layout/starter-content/starter-content.component';
import { StarterFooterComponent } from '../layout/starter-footer/starter-footer.component';
import { StarterControlSidebarComponent } from '../layout/starter-control-sidebar/starter-control-sidebar.component';
import { RouterModule } from '@angular/router';
import { PurchaseEntryComponent } from './purchase-entry/purchase-entry.component';
import { MyDatePickerModule } from 'mydatepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopupModule } from 'ng2-opd-popup';
import { PurchaseReturnComponent } from './purchase-return/purchase-return.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { ToasterModule } from 'angular2-toaster';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../shared/shared.module';
import { PurchaseEntryService } from './purchase-entry/purchase-entry.service';
import { PurchaseOrderService } from './purchase-order/purchase-order.service';
import { ExpiryStockComponent } from './expiry-stock/expiry-stock.component';
import { ExpiryStockService } from './expiry-stock/expiry-stock.service';
import { ModalModule } from 'ngx-modialog';
import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';
import { IssueItemStockComponent } from './issue-item-stock/issue-item-stock.component';
import { IssueItemStockService } from './issue-item-stock/issue-item-stock.service';
import { UserService } from '../user/user.service';
import { BrowserXhr } from '@angular/http';
import { NgProgressBrowserXhr, NgProgressModule } from 'ngx-progressbar';
import { PurchaseReturnService } from './purchase-return/purchase-return.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        StockRoutingModule,
        LayoutModule,
        MyDatePickerModule,
        PopupModule.forRoot(),
        ReactiveFormsModule,
        NguiAutoCompleteModule,
        ToasterModule,
        NgxPaginationModule,
        SharedModule,
        RouterModule,
        ModalModule.forRoot(),
        BootstrapModalModule,
        NgProgressModule
    ],
    declarations: [
        StockComponent,
        PurchaseEntryComponent,
        PurchaseReturnComponent,
        PurchaseOrderComponent,
        ExpiryStockComponent,
        IssueItemStockComponent,
        PurchaseReturnComponent
    ],
    providers: [Safe, ExpiryStockService, IssueItemStockService,
        PurchaseEntryService, PurchaseOrderService, UserService, PurchaseReturnService, { provide: BrowserXhr, useClass: NgProgressBrowserXhr }],
    exports: [StockComponent]
})
export class StockModule { }
