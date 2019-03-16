import { NgModule } from '@angular/core';
import { TimeAgoPipe } from 'time-ago-pipe/time-ago-pipe';
import { ShowErrorsComponent } from './showerrors.component';
import { DateTimePickerDirective } from 'ng2-eonasdan-datetimepicker/src/datetimepicker.directive';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    exports: [
        TimeAgoPipe,
        DateTimePickerDirective,
        ShowErrorsComponent
    ],
    declarations: [
        TimeAgoPipe,
        ShowErrorsComponent,
        DateTimePickerDirective
    ],
    providers: [],
})
export class SharedModule { }
