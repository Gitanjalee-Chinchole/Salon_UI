import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { OpeningStock } from './openingStock';
import { URLSearchParams } from '@angular/http';

@Injectable()
export class OpeningStockService {
    constructor(private http: Http) { }

    getPaginateOpeningStock(unitsPerPage: number, currentPage: number, searchKey: any,
        sortOn: string, sortDirection: string): Observable<any> {
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
        return this.http.get('/opening_stocks/filter', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    addOpeningItems(body: any): Observable<any> {
        console.log(body);
        const headers = new Headers(); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post('/opening_stocks', body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getOpeningItemById(id: number): Observable<OpeningStock> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/opening_stocks/edit/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    updateOpeningStockItem(body: any, id: string): Observable<any> {
        const headers = new Headers(); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put('/opening_stocks/' + id, body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    deleteOpeningStockItem(id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.delete('/opening_stocks/' + id, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }

    uploadExcelOpeningItems(body: any): Observable<any> {
        const headers = new Headers(); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post('/opening_stocks/uploadFile', body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
}
