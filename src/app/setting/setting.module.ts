import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Safe } from '../confirm/safehtml.component';
import { SettingComponent } from './setting.component';
import { LayoutModule } from '../layout/layout.module';
import { RoleComponent } from './role/role.component';
import { SettingRoutingModule } from './setting-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { WindowRef } from '../shared/windowRef';
import { RoleService } from './role/role.service';


@NgModule({
    imports: [
        CommonModule,
        LayoutModule,
        SettingRoutingModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        ToasterModule,
        RouterModule,
        NgxPaginationModule,
        SharedModule
    ],
    declarations: [
        SettingComponent,
        RoleComponent
    ],
    providers: [Safe, RoleService, WindowRef],
    exports: [SettingComponent]
})
export class SettingModule { }
