import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { PurchaseOrder } from './purchase-order';

@Injectable()
export class PurchaseOrderService {

  constructor(private http: Http) { }
  getPurchaseOrders(): Observable<any> {
    const headers = new Headers({});
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/purchase_order', requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getPurchaseOrdersPaginate(ordersPerPage: number, currentPage: number, searchKey: any, sortOn: string, sortDirection: string):
    Observable<any> {
    const headers = new Headers({});
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    const params: URLSearchParams = new URLSearchParams();
    if (currentPage) {
      params.set('page', currentPage.toString());
    }
    if (ordersPerPage) {
      params.set('ordersPerPage', ordersPerPage.toString());
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
    return this.http.get('/purchase_order/paginate', requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'server Error'));
  }

  addPurchaseOrder(body: object) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.post('/purchase_order', body, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getEditPurchaseOrder(id: number): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/purchase_order/' + id, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
  getOrderById(id: number): Observable<PurchaseOrder> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers }); // Create a request option
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/purchase_order/edit/' + id, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
  updatePurchaseOrder(body: object, id: string): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    return this.http.put('/purchase_order/' + id, body, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  deletePurchaseOrder(id: string): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.delete('/purchase_order/' + id, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
}
