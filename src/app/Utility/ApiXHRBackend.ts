import { Request, XHRBackend, XHRConnection } from '@angular/http';
import { Injectable } from '@angular/core';
import { AuthResponse } from '../authentication/authentication.response.model';
import { environment } from '../../environments/environment';
// import { AuthResponse } from '../authentication/authentication.response.model';

@Injectable()
export class ApiXHRBackend extends XHRBackend {
  //private baseUrl = 'http://192.168.1.10:8888/api';
  // private baseUrl = 'http://salonapi.sagarmutha.com/api';

  // private baseUrl = 'https://127.0.0.1:8000/api';
  private baseUrl = environment.api_url;
  // private baseUrl = 'http://175.100.138.103:85/societywebapi/api';
  createConnection(request: Request): XHRConnection {

    if (request.url.startsWith('/')) {
      if (request.url.indexOf('/api/login') === 0) {
        this.baseUrl = this.baseUrl.replace('/api', '/');
      } else {
        this.baseUrl += this.baseUrl.endsWith('/api') ? '' : '/api';
        if (sessionStorage.getItem('AuthResponse')) {
          const authResponse: AuthResponse = JSON.parse(sessionStorage.getItem('AuthResponse'));
          const headers = request.headers;
          headers.append('Authorization', 'bearer ' + authResponse.access_token);
        }
      }
      request.url = this.baseUrl + request.url; // prefix base url
    }
    return super.createConnection(request);
  }
}
