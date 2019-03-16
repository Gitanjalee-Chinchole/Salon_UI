import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { CustomerComponent } from './customer.component';
import { PopupModule } from 'ng2-opd-popup';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToasterModule } from 'angular2-toaster';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MyDatePickerModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        ToasterModule,
        RouterModule,
        SharedModule,
        PopupModule.forRoot()
    ],
    declarations: [
        CustomerComponent,
    ],
    exports: [CustomerComponent]
})
export class CustomerModule { }
