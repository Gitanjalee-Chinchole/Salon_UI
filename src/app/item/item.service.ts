import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Item } from './item';
import { URLSearchParams } from '@angular/http';

@Injectable()
export class ItemService {
    constructor(private http: Http) { }
    exportInternalOrder() {
        // let user_token: string = this.sessionService.getToken();
        const headers = new Headers();
        // headers.append('Authorization', 'Bearer ' + user_token);
        return this.http.post('/items/xls/download/', {
            headers: headers,
            responseType: ResponseContentType.Blob
        }).map((res: Response) =>
            res.blob())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

        // .map((res: Response) => new Blob([res['_body'], { type: 'application/vnd.ms-excel' }))
        // .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getItemById(id: number): Observable<Item> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/items/edit/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getAllItems(itemsPerPage: number, currentPage: number, searchKey: any, sortOn: string, sortDirection: string): Observable<Item[]> {
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
        return this.http.get('/items/' + itemsPerPage, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    addItem(body: object): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post('/items', body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }

    updateItem(body: object, id: number): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put('/items/' + id, body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }


    searchIngredients(searchKey: string, type: string, column: string) {
        const headers = new Headers({});
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        const params: URLSearchParams = new URLSearchParams();
        if (searchKey) {
            params.set('searchkey', searchKey.toString());
        }
        if (type) {
            params.set('type', type.toString());
        }
        if (column) {
            params.set('on', column.toString());
        }
        requestOptions.params = params;
        return this.http.get('/items/ingredients/search', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    itemSearchByName(searchKey: string, type: string, column: string) {
        const headers = new Headers({});
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        const params: URLSearchParams = new URLSearchParams();
        if (searchKey) {
            params.set('searchkey', searchKey.toString());
        }
        if (type) {
            params.set('type', type.toString());
        }
        if (column) {
            params.set('on', column.toString());
        }
        requestOptions.params = params;
        return this.http.get('/items/search_name', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    itemImageUpload(formData: any): Observable<any> {
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        // headers.append('Authorization', 'Bearer ' + localStorage.token);

        const options = new RequestOptions({ headers: headers });
        return this.http.post('/uploadImage', formData, options)
            .map(res => res.json())
            .catch(error => Observable.throw(error));
    }

    // downloadFile(id): Observable<Blob> {
    //     let options = new RequestOptions({ responseType: ResponseContentType.Blob });
    //     return this.http.get('/items/xls/download' + '/', options)
    //         .map(res => res.blob())
    //         .catch(this.handleError)
    // }

    exportToExcel(): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' });

        const requestOptions = new RequestOptions();
        requestOptions.responseType = ResponseContentType.Blob;
        requestOptions.headers = headers;
        return this.http.get('/items/xls/download/', requestOptions)
            .map(response => response.blob())
            .catch(error => Observable.throw(error));
    }

    uploadItems(body: any): Observable<any> {
        console.log(body);
        const headers = new Headers(); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post('/importItems', body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    saveDuplicateItems(body: any): Observable<any> {
        console.log(body);
        const headers = new Headers(); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post('/saveitems', body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    deleteItem(id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.delete('/items/' + id, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
}
