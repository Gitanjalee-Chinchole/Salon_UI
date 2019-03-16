import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { URLSearchParams } from '@angular/http';
import { PackageSetup } from './package-setup';

@Injectable()
export class PackageSetupService {
    constructor(private http: Http) { }
    getAllPackages() {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/package_setups', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getAllPackage(itemsPerPage: number, currentPage: number, searchKey: any, sortOn: string,
        sortDirection: string): Observable<PackageSetup[]> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;

        const params: URLSearchParams = new URLSearchParams();
        if (currentPage) {
            params.set('page', currentPage.toString());
        }
        if (itemsPerPage) {
            params.set('itemsPerPage', itemsPerPage.toString());
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
        return this.http.get('/package_setups/paginate', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    addPackageSetup(body: object): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post('/package_setups', body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
    getPackageById(id: number): Observable<PackageSetup> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/package_setups/edit/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    updatePackage(body: object, id: number): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put('/package_setups/' + id, body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
    deletePackage(id: string): Observable<PackageSetup> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.delete('/package_setups/' + id, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
}
