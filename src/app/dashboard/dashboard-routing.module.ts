
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AppointmentComponent } from '../appointment/appointment.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'dashboard',
                component: DashboardComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'appointment'
                    },
                    {
                        path: 'appointment',
                        component: AppointmentComponent
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class DashboardRoutingModule { }
