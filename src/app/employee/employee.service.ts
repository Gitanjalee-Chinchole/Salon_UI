import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { URLSearchParams } from '@angular/http';
import { Employee } from './employee';

@Injectable()
export class EmployeeService {
    constructor(private http: Http) { }
    getAllEmployees() {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/employees', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getAllEmployee(employeesPerPage: number, currentPage: number, searchKey: any, sortOn: string,
        sortDirection: string): Observable<Employee[]> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;

        const params: URLSearchParams = new URLSearchParams();
        if (currentPage) {
            params.set('page', currentPage.toString());
        }
        if (employeesPerPage) {
            params.set('employeesPerPage', employeesPerPage.toString());
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
        return this.http.get('/employees/paginate', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getAllStylist() {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/employees/stylists', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    addEmployee(body: object): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post('/employees', body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
    getEmployeeById(id: number): Observable<Employee> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/employees/edit/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    updateEmployee(body: object, id: number): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put('/employees/' + id, body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
    deleteEmployee(id: string): Observable<Employee> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.delete('/employees/' + id, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }

    getAllEmployeeWorkingTimes() {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/employees/workingtimes', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
}
