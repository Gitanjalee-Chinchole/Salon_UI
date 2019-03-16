import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { LayoutModule } from '../layout/layout.module';
import { AppointmentComponent } from '../appointment/appointment.component';
import { CP1Directive } from '../appointment/cp1.directive';
import { AddDays } from '../appointment/add-dayes.pipe';
import { SafeDom } from '../custome-components/SafeDom.component';
import { PopupModule } from 'ng2-opd-popup';
import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';

import { AppointmentService } from '../appointment/appointement.service';
import { HttpClientModule } from '@angular/common/http';
import { ToasterModule } from 'angular2-toaster';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { SharedModule } from '../shared/shared.module';
import { UiSwitchModule } from 'ngx-toggle-switch/src';
import { SpinnerComponentModule } from 'ng2-component-spinner';

import { ModalModule } from 'ngx-modialog';
import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';
import { VexModalModule } from 'ngx-modialog/plugins/vex';
import { FlightControlDialog } from '../appointment/custome-dialog';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MyDatePickerModule,
        LayoutModule,
        ReactiveFormsModule,
        DashboardRoutingModule,
        PopupModule.forRoot(),
        // TimePickerModule,
        SharedModule,
        ToasterModule,
        NguiAutoCompleteModule,
        HttpClientModule,
        UiSwitchModule,
        SpinnerComponentModule,
        ModalModule.forRoot(),
        BootstrapModalModule,
        VexModalModule
    ],
    declarations: [
        DashboardComponent,
        AppointmentComponent,
        CP1Directive,
        AddDays,
        SafeDom,
        AddAppointmentComponent,
        FlightControlDialog
    ],
    providers: [SafeDom, AppointmentService],
    exports: [DashboardComponent], entryComponents: [FlightControlDialog]
})
export class DashboardModule { }
