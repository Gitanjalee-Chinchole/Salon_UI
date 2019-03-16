import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading = false;
  invalid = false;
  user: any = {};
  constructor(private router: Router, private authService: AuthenticationService) {
  }

  ngOnInit() {
  }

  login() {
    this.loading = true;
    this.authService.login(this.user.username, this.user.pwd)
      .subscribe(
      data => {
        this.router.navigate(['/dashboard/']);
      },
      error => {
        this.invalid = true;
        console.log('error');
        this.loading = false;
      });
  }

}
