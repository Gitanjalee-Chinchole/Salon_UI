import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AuthResponse } from './authentication.response.model';

@Injectable()
export class AuthenticationService {

  // private authUrl = '/api/token';

  constructor(private http: Http) { }
  login(username: string, password: string): Observable<boolean> {

    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers }); // Create a request option

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('username', username);
    urlSearchParams.append('password', password);
    const body = urlSearchParams.toString();

    return this.http.post('/login', body, options)
      .map((response: Response) => {

        const token = response.json() && response.json().access_token;
        if (token) {
          sessionStorage.setItem('AuthResponse', JSON.stringify(response.json()));
          // console.log('Auth Reponse : ', sessionStorage.getItem('AuthResponse'));
          return true;
        } else {
          return false;
        }
      });
  }
  getAccessToken(): string {
    const authResponse: AuthResponse = JSON.parse(sessionStorage.getItem('AuthResponse'));
    return authResponse.access_token;
  }
  getUserId(): string {
    const authResponse: AuthResponse = JSON.parse(sessionStorage.getItem('AuthResponse'));
    return authResponse.userId;
  }

  getUserName(): string {
    const authResponse: AuthResponse = JSON.parse(sessionStorage.getItem('AuthResponse'));
    return authResponse.userName;
  }

  getUserEmail(): string {
    const authResponse: AuthResponse = JSON.parse(sessionStorage.getItem('AuthResponse'));
    return authResponse.email;
  }
  logout() {
    // remove user from local storage to log user out
    sessionStorage.removeItem('AuthResponse');
    // console.log('Logout');
  }
}
