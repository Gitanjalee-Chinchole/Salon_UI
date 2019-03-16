import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { URLSearchParams } from '@angular/http';
import { PackageAssignment } from './package-assignment';

@Injectable()
export class PackageAssignmentService {
    constructor(private http: Http) { }
    getAllPackagesAssign() {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/package_assignments', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getCustomerPackageById(id: number): Observable<PackageAssignment> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/package_assignments/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getAllPackageAssign(itemsPerPage: number, currentPage: number, searchKey: any, sortOn: string,
        sortDirection: string): Observable<PackageAssignment[]> {
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
        return this.http.get('/package_assignments/paginate', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    addPackageAssign(body: object): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post('/package_assignments', body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
    getPackageAssignById(id: number): Observable<PackageAssignment> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/package_assignments/edit/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    updatePackageAssign(body: object, id: number): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put('/package_assignments/' + id, body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
    deletePackageAssign(id: string): Observable<PackageAssignment> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.delete('/package_assignments/' + id, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
}
