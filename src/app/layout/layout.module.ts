import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StarterHeaderComponent } from './starter-header/starter-header.component';
import { StarterLeftSideComponent } from './starter-left-side/starter-left-side.component';
import { StarterContentComponent } from './starter-content/starter-content.component';
import { StarterFooterComponent } from './starter-footer/starter-footer.component';
import { StarterControlSidebarComponent } from './starter-control-sidebar/starter-control-sidebar.component';
import { EmployeeComponent } from '../employee/employee.component';
import { CustomerModule } from '../customer/customer.module';
import { EmployeeModule } from '../employee/employee.module';
import { UnitComponent } from '../unit/unit.component';
import { Safe } from '../confirm/safehtml.component';
import { OpeningStockModule } from '../openingStock/openingStock.module';
import { ItemComponent } from '../item/item.component';
import { StockComponent } from '../stock/stock.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    declarations: [
        StarterHeaderComponent,
        StarterLeftSideComponent,
        StarterContentComponent,
        StarterFooterComponent,
        StarterControlSidebarComponent
    ],
    providers: [Safe],
    exports: [
        StarterHeaderComponent,
        StarterLeftSideComponent,
        StarterContentComponent,
        StarterFooterComponent,
        StarterControlSidebarComponent]
})
export class LayoutModule { }
