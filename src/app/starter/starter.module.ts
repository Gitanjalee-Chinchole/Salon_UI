import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StarterComponent } from './starter.component';
import { StarterRoutingModule } from './starter-router.module';

import { EmployeeComponent } from '../employee/employee.component';
import { CustomerModule } from '../customer/customer.module';
import { EmployeeModule } from '../employee/employee.module';
import { UnitComponent } from '../unit/unit.component';
import { Safe } from '../confirm/safehtml.component';
import { OpeningStockModule } from '../openingStock/openingStock.module';
import { ItemComponent } from '../item/item.component';
import { StockComponent } from '../stock/stock.component';
import { LayoutModule } from '../layout/layout.module';
import { RouterModule } from '@angular/router';
import { PopupModule } from 'ng2-opd-popup';
import { MyDatePickerModule } from 'mydatepicker';
import { DashboardModule } from '../dashboard/dashboard.module';
import { DashboardRoutingModule } from '../dashboard/dashboard-routing.module';
import { ScheduleEmployeeModule } from '../schedule-employee/schedule-employee.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserXhr, HttpModule } from '@angular/http';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CategoryService } from '../category/category.service';
import { UnitService } from '../unit/unit.service';
import { ItemService } from '../item/item.service';
import { ToasterModule } from 'angular2-toaster/src/toaster.module';
import { CommonService } from '../shared/common.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CategoryComponent } from '../category/category.component';
import { FileUploadModule, FileUploader } from 'ng2-file-upload';
import { SpinnerComponentModule } from 'ng2-component-spinner';
import { EventEmiterService } from '../shared/event-emitter.service';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NgProgressModule, NgProgressBrowserXhr } from 'ngx-progressbar';
import { ShowErrorsComponent } from '../shared/showerrors.component';
import { CustomerService } from '../customer/customer.service';
import { SharedModule } from '../shared/shared.module';
import { SupplierService } from '../supplier/supplier.service';
import { SupplierComponent } from '../supplier/supplier.component';
import { EmployeeService } from '../employee/employee.service';
import { UserComponent } from '../user/user.component';
import { WindowRef } from '../shared/windowRef';

@NgModule({
        imports: [
                CommonModule,
                LayoutModule,
                StarterRoutingModule,
                // DashboardRoutingModule,
                CustomerModule,
                EmployeeModule,
                OpeningStockModule,
                MyDatePickerModule,
                PopupModule.forRoot(),
                DashboardModule,
                ScheduleEmployeeModule,
                ReactiveFormsModule,
                FormsModule,
                HttpModule,
                // TimeAgoModule,
                NgxBarcodeModule,
                ToasterModule,
                NgxPaginationModule,
                FileUploadModule,
                SpinnerComponentModule,
                NguiAutoCompleteModule,
                NgProgressModule,
                SharedModule,

        ],
        declarations: [
                StarterComponent,
                UnitComponent,
                ItemComponent,
                // ShowErrorsComponent,
                CategoryComponent,
                SupplierComponent,
                UserComponent
        ],
        providers: [
                Safe,
                CategoryService,
                UnitService,
                ItemService,
                CommonService,
                EventEmiterService,
                CustomerService,
                SupplierService,
                EmployeeService,
                { provide: BrowserXhr, useClass: NgProgressBrowserXhr },
                // WindowRef
        ],
        exports: [StarterComponent]
})
export class StarterModule { }
