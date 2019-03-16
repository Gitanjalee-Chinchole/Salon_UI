import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from '../authentication/authentication.service';
import { retry } from 'rxjs/operator/retry';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  privilage = false;
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return true;
  }

  constructor(private router: Router,
    private authenticationservice: AuthenticationService) {
  }

  canActivate() {
    if (sessionStorage.getItem('currentUser')) {
      // logged in so return true
      return true;
    }

    // not logged in so redirect to login page
    this.router.navigate(['/login']);
    return false;
  }

}
