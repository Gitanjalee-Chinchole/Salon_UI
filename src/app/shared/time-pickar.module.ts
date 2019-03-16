import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { DateTimePickerDirective } from 'ng2-eonasdan-datetimepicker/src/datetimepicker.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    declarations: [
        // DateTimePickerDirective
    ],
    exports: [
        // DateTimePickerDirective
    ]
})
export class TimePickerModule { }
