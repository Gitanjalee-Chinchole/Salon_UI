import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthGuard } from './auth.guard';
import { AuthenticationService } from './authentication.service';
import { ToasterModule } from 'angular2-toaster';

@NgModule({
  imports: [
    CommonModule,
    ToasterModule
  ],
  declarations: [],
  exports: [],
  providers: [AuthGuard, AuthenticationService]
})
export class AuthenticatioModule { }
