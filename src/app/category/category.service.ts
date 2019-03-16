import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { RequestOptions, Http, Headers, Response, URLSearchParams, ResponseContentType, ResponseOptions } from '@angular/http';
import { Category } from './category';


@Injectable()
export class CategoryService {
    constructor(private http: Http) { }
    getCategoryAll(): Observable<Category[]> {
        const headers = new Headers({});
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/categorys', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getAllCategories(id: number): Observable<Category[]> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers }); // Create a request option
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/categorys/parent/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getPaginationCategories(unitsPerPage: number, currentPage: number,
        searchKey: any, sortOn: string, sortDirection: string): Observable<Category[]> {
        const headers = new Headers({});
        const options = new RequestOptions({ headers: headers }); // Create a request option
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
        return this.http.get('/categorys/paginate', requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    addCategory(body: object) {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.post('/categorys', body, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    getCategoryEdit(id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions();
        requestOptions.headers = headers;
        return this.http.get('/categorys/' + id, requestOptions)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
    updateCategory(body: object, id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put('/categorys/' + id, body, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
    deleteCategory(id: string): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        const options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.delete('/categorys/' + id, options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    }
    getXls(): Observable<Blob> {
        const headers = new Headers({});
        headers.append('responseType', 'Blob');
        const requestOptions = new RequestOptions({ responseType: ResponseContentType.Blob });
        requestOptions.headers = headers;
        return this.http.get('/categorys/xls', requestOptions)
            .map(response => response.blob())
            .catch(error => { return Observable.throw(error) });

        // return this.http.get('/categorys/xls', requestOptions)
        //     .map((res: Response) => {
        //         console.log('sdas');
        //         if (res.status === 200) {
        //             const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        //             var blob = new Blob([(<any>res)._body], { type: contentType });
        //             console.log('sss');
        //             return blob;
        //         }
        //     }
        //     )
        //     .catch((error: any) => {

        //         return Observable.throw(error.json().error || 'Server error')

        //     });
    }
}
