import { AdminModule } from './admin/admin.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StarterComponent } from './starter/starter.component';
import { AdminComponent } from './admin/admin.component';
import { AdminHeaderComponent } from './admin/admin-header/admin-header.component';
import { AdminLeftSideComponent } from './admin/admin-left-side/admin-left-side.component';
import { AdminContentComponent } from './admin/admin-content/admin-content.component';
import { AdminFooterComponent } from './admin/admin-footer/admin-footer.component';
import { AdminControlSidebarComponent } from './admin/admin-control-sidebar/admin-control-sidebar.component';
import { AdminDashboard1Component } from './admin/admin-dashboard1/admin-dashboard1.component';
import { StarterRoutingModule } from './starter/starter-router.module';
import { StarterModule } from './starter/starter.module';
import { SupplierComponent } from './supplier/supplier.component';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from './confirm/confirm.component';
import { Safe } from './confirm/safehtml.component';

import { PopupModule } from 'ng2-opd-popup';
import { RouterModule } from '@angular/router';
import { PackageModule } from './package/package.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnitService } from './unit/unit.service';
import { LoginComponent } from './login/login.component';
import { XHRBackend } from '@angular/http';
import { ApiXHRBackend } from './Utility/ApiXHRBackend';
import { AuthenticatioModule } from './authentication/authentication.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { SettingModule } from './setting/setting.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { StockModule } from './stock/stock.module';

@NgModule({
  declarations: [
    AppComponent,
    ConfirmComponent,
    Safe,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BootstrapModalModule.forRoot({ container: document.body }),
    AppRoutingModule,
    AdminModule,
    StarterModule,
    PackageModule,
    StockModule,
    BrowserAnimationsModule,
    AuthenticatioModule,
    SettingModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  providers: [Safe, { provide: XHRBackend, useClass: ApiXHRBackend }, UnitService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  entryComponents: [
    ConfirmComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
