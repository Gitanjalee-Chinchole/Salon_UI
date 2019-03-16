import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Appointments } from './appointment';
import { AppComponent } from '../app.component';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class AppointmentService {
  appointments: any;
  appointmentData: Appointments[] = [];
  constructor(private http: Http) {
    this.appointments = [{
      appointmentDate: '31/01/2017',
      appointmentTime: '14:30:00',
      appointmentEndTime: '15:30:00',
      clientName: 'John',
      serviceType: 'Hair Cutting',
      status: 'CheckIn',
      styleListName: 'Irfan Mulani'
    }];
    //  this.getMockUpData();
  }
  getMockUpData() {
    // this.appointmentData.push({
    //   id: 1,
    //   appoitment_date: '30/01/2018 15:30:00',
    //   status: 'checkIn',
    //   customer: 'John',
    //   services: [{ id: 1, itemName: 'Hair Cutting', serviceTime: '30:00' }]
    // },
    //   {
    //     id: 2,
    //     appoitment_date: '30/01/2018 14:30:00',
    //     status: 'open',
    //     customer: 'John',
    //     services: [{ id: 2, itemName: 'Hair Spa', serviceTime: '40:00' }]
    //   },
    //   {
    //     id: 3,
    //     appoitment_date: '31/01/2018 12:30:00',
    //     status: 'checkIn',
    //     customer: 'Walk In',
    //     services: [{ id: 2, itemName: 'Hair Spa', serviceTime: '40:00' },
    //     { id: 3, itemName: 'Hair Cutting', serviceTime: '30:00' }]
    //   });
  }
  getallAppointments(): any {
    const headers = new Headers({});
    const options = new RequestOptions({ headers: headers }); // Create a request option
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/appointements', requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
  getAppointmentById(id: string): any {
    const headers = new Headers({});
    const options = new RequestOptions({ headers: headers }); // Create a request option
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.get('/appointements/' + id, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
  addAppointement(body: object): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions();
    requestOptions.headers = headers;
    return this.http.post('/appointements', body, requestOptions)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  updateAppointement(body: object, id: number): Observable<any> {
    const headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.put('/appointements/' + id, body, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

  }
}

export class Services {
  constructor() {
    this.id = 5;
    this.serviceName = 'Abc',
      this.serviceTime = '12:22';
  }
  id: number;
  serviceName: string;
  serviceTime: string;
}
