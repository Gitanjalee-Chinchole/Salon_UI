import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RequestOptions, Http, Headers, Response, URLSearchParams, ResponseContentType, ResponseOptions } from '@angular/http';
import { Role } from './role';

@Injectable()
export class RoleService {

  constructor(private http: Http) { }

  getRoles(): Observable<any> {
    const headers = new Headers({});
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/roles', requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
  getPaginateRoles(rolesPerPage: number, currentPage: number, searchKey: any, sortOn: string, sortDirection: string): Observable<any> {
    const headers = new Headers({});
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    const params: URLSearchParams = new URLSearchParams();
    if (currentPage) {
      params.set('page', currentPage.toString());
    }
    if (rolesPerPage) {
      params.set('rolesPerPage', rolesPerPage.toString());
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
    return this.http.get('/roles/paginate', requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
  addRole(body: object) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.post('/roles', body, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getRoleEdit(id: string): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/roles/' + id, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  updateRole(body: object, id: string): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.put('/roles/' + id, body, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  deleteRole(id: string): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.delete('/roles/' + id, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

  }
}
