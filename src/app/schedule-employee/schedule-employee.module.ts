import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { RouterModule } from '@angular/router';
import { ScheduleEmployeeComponent } from './schedule-employee.component';
import { PopupModule } from 'ng2-opd-popup';

import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MyDatePickerModule,
        ReactiveFormsModule,
        PopupModule.forRoot(),
        // TimePickerModule
        SharedModule
    ],
    declarations: [
        ScheduleEmployeeComponent,

    ],
    exports: [ScheduleEmployeeComponent]
})
export class ScheduleEmployeeModule { }
