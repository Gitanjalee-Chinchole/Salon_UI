import { Injectable } from '@angular/core';
import { RequestOptions, Response, Headers, Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { error } from 'util';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Unit } from './unit';


@Injectable()
export class UnitService {

    constructor(private http: Http) { }
    addUnit(body: object) {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post('/units', body, options)
            .map((res: Response) => res.json()).catch((error: any) => {
                if (error.status === 422) {
                    return [{ status: error.status, json: error }];
                }
            });
    }

    getUnit(): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/units', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json()));
    }
    getPaginateUnit(unitsPerPage: number, currentPage: number, searchKey: any, sortOn: string, sortDirection: string): Observable<any> {
        const headers = new Headers({});
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        const params: URLSearchParams = new URLSearchParams();
        if (currentPage) {
            params.set('page', currentPage.toString());
        }
        if (unitsPerPage) {
            params.set('unitsperpage', unitsPerPage.toString());
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
        return this.http.get('/units/paginate', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getUnitEdit(id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/units/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    updateUnit(body: object, id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put('/units/' + id, body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
    deleteUnits(id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.delete('/units/' + id, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
}

