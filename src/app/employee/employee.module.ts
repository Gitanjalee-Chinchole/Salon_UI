import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { EmployeeComponent } from './employee.component';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../shared/shared.module';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';

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
        NguiAutoCompleteModule
    ],
    declarations: [
        EmployeeComponent,
    ],
    exports: [EmployeeComponent]
})
export class EmployeeModule { }
