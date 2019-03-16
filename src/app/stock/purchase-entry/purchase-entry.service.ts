import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Purchase } from './purchase-entry';
import { Options } from 'selenium-webdriver/firefox';

@Injectable()
export class PurchaseEntryService {

  constructor(private http: Http) { }

  getPurchases(): Observable<any> {
    const headers = new Headers({});
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/purchase', requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getPurchaseEntriesPaginate(purchasesPerPage: number, currentPage: number, searchKey: any, sortOn: string, sortDirection: string):
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
    return this.http.get('/purchase/paginate', requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'server Error'));
  }

  addPurchaseEntry(body: object) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.post('/purchase', body, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getEditPurchaseEntry(id: number): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/purchase/' + id, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getPurchaseEntryById(id: number): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers }); // Create a request option
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/purchase/edit/' + id, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  updatePurchaseEntry(id: string, body: object): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    return this.http.put('/purchase/' + id, body, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getPurchaseBySupplier(id: number): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers }); // Create a request option
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/purchase/bySupplier/' + id, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  deletePurchaseEntry(id: string): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.delete('/purchase/' + id, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  uploadItemsExcelData(body: object): Observable<any> {
    const headers = new Headers();
    const requestOptions = new RequestOptions({ headers: headers });
    return this.http.post('/purchase/uploadItems', body, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
}
