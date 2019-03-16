import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { PurchaseReturn } from './purchase-return';

@Injectable()
export class PurchaseReturnService {

    constructor(private http: Http) { }
    getPurchaseReturn(): Observable<any> {
        const headers = new Headers({});
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/purchase_return', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getPurchaseReturnPaginate(purchasesPerPage: number, currentPage: number, searchKey: any, sortOn: string, sortDirection: string):
        Observable<any> {
        const headers = new Headers({});
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        const params: URLSearchParams = new URLSearchParams();
        if (currentPage) {
            params.set('page', currentPage.toString());
        }
        if (purchasesPerPage) {
            params.set('purchasesPerPage', purchasesPerPage.toString());
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
        return this.http.get('/purchase_return/paginate', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'server Error'));
    }

    addPurchasereturn(body: object) {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.post('/purchase_return', body, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getEditPurchaseReturn(id: number): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/purchase_return/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getPurchaseReturnById(id: number): Observable<PurchaseReturn> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/purchase_return/edit/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    updatePurchaseReturn(body: object, id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });
        return this.http.put('/purchase_return/' + id, body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    deletePurchaseReturn(id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.delete('/purchase_return/' + id, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
}
