// import { AdminDashboard2Component } from './../admin/admin-dashboard2/admin-dashboard2.component';
// import { AdminDashboard1Component } from './../admin/admin-dashboard1/admin-dashboard1.component';
import { StarterComponent } from './../starter/starter.component';
import { AdminComponent } from './../admin/admin.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StockComponent } from '../stock/stock.component';
import { PackageComponent } from '../package/package.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { LoginComponent } from '../login/login.component';
import { SettingComponent } from '../setting/setting.component';


@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'master', component: StarterComponent },
      { path: 'stock', component: StockComponent },
      { path: 'package', component: PackageComponent },
      { path: 'setting', component: SettingComponent },
    ])
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
