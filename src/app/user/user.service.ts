import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RequestOptions, Http, Headers, Response, URLSearchParams, ResponseContentType, ResponseOptions } from '@angular/http';

@Injectable()
export class UserService {

  constructor(private http: Http) { }
  getUsers(): Observable<any> {
    const headers = new Headers({});
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/users', requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getPaginateUsers(usersPerPage: number, currentPage: number, searchKey: any, sortOn: string, sortDirection: string): Observable<any> {
    const headers = new Headers({});
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    const params: URLSearchParams = new URLSearchParams();
    if (currentPage) {
      params.set('page', currentPage.toString());
    }
    if (usersPerPage) {
      params.set('usersPerPage', usersPerPage.toString());
    }
    if (searchKey) {
      params.set('searchkey', searchKey.toString());
    }
    if (sortOn) {
      params.set('sort', sortOn.toString());
    }
    if (sortDirection) {
      params.set('direction', sortDirection.toString());
    }
    requestOptions.params = params;
    return this.http.get('/users/paginate', requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  addUsers(body: object) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.post('/users', body, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getEditUsers(id: string): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/users/' + id, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  updateUser(body: object, id: string): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.put('/users/' + id, body, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  deleteUsers(id: string): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.delete('/users/' + id, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
}
