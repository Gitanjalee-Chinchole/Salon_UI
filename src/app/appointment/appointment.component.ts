import {
  Component, OnInit, ElementRef, ViewEncapsulation, EventEmitter, Output, ViewChild,
  AfterContentInit, ViewContainerRef
} from '@angular/core';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { IMyDpOptions, IMyDate, IMyDateModel } from 'mydatepicker';
import { forEach } from '@angular/router/src/utils/collection';
declare var jquery: any;
declare var $: any;
import * as moment from 'moment';
import { CP1Directive } from './cp1.directive';
import { Popup } from 'ng2-opd-popup';
import { AppComponent } from '../app.component';
import { AppointmentService } from './appointement.service';
import { ToasterService, ToasterConfig, Toast } from 'angular2-toaster';
import { FormGroup } from '@angular/forms/src/model';
import { EventEmiterService } from '../shared/event-emitter.service';
import { Appointments } from './appointment';
import { Customer } from '../customer/customer';
import { CustomerService } from '../customer/customer.service';
import { slideIn } from '../shared/animation';
import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';
import { Employee } from '../employee/employee';
import { EmployeeService } from '../employee/employee.service';
import { environment } from '../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { Overlay, overlayConfigFactory } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { FlightControlDialog } from './custome-dialog';
import { FlightControlDialogData } from './custome-control-dialog-data';


@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideIn]
})
export class AppointmentComponent implements OnInit, AfterViewInit {

  i = 1;
  date1 = new Date();
  api_url = environment.api_url;
  tempData: any;
  tableView = false;
  employee = 'All';
  days = 1;
  tableHeader = [];
  tableData = [];
  public selDate: IMyDate = { year: 0, month: 0, day: 0 };
  appointmmentDate: IMyDate = { year: 0, month: 0, day: 0 };
  customers: Customer[] = [];
  appoitmentForm: FormGroup;
  appointements: any;
  data = { 'dates': [], 'data1': 'Irfan', 'data2': '', 'data3': '', 'data4': '', 'data5': '' };
  objectKeys = Object.keys;
  selectedStylistPic: any;
  spinner = false;
  stylists: Employee[] = [];
  public config1: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-right',
    showCloseButton: false,
    tapToDismiss: false,
    animation: 'fade',
    timeout: '1000'
  });
  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    height: '28px',
    disableUntil: {
      year: this.date1.getFullYear(),
      month: this.date1.getMonth() + 1,
      day: this.date1.getDate() - 1
    }
  };
  @ViewChild(CP1Directive) directive: CP1Directive;
  @ViewChild(AddAppointmentComponent) addAppointementComponent: AddAppointmentComponent;

  popToast(message: string, type: string) {
    if (type === '50') {
      type = 'error';
    } else if (type === '51') {
      type = 'warning';
    } else {
      type = 'success';
    }
    const toast: Toast = {
      type: type,
      title: 'Appointment',
      body: message
    };

    this.toasterService.pop(toast);
  }


  constructor(private elRef: ElementRef, private popup: Popup,
    private _appointmentService: AppointmentService,
    private toasterService: ToasterService,
    private _eventEmiter: EventEmiterService,
    private _customerService: CustomerService,
    private vcRef: ViewContainerRef,
    private _employeeService: EmployeeService,
    private _sanitizer: DomSanitizer,
    public _modal: Modal) {

    this.getAllStylists();
    this.date1 = new Date();
    this.selDate = {
      year: this.date1.getFullYear(),
      month: this.date1.getMonth() + 1,
      day: this.date1.getDate()
    };

    this.appointmmentDate = {
      year: this.date1.getFullYear(),
      month: this.date1.getMonth() + 1,
      day: this.date1.getDate()
    };
    this.popup.options = {
      header: 'Add Appointment',
      color: '#dd4b39', // red, blue....
      widthProsentage: 80, // The with of the popou measured by browser width
      animationDuration: 0.5, // in seconds, 0 = no animation
      showButtons: false, // You can hide this in case you want to use custom buttons
      confirmBtnContent: 'OK', // The text on your confirm button
      cancleBtnContent: 'Cancel', // the text on your cancel button
      confirmBtnClass: 'btn btn-default', // your class for styling the confirm button
      cancleBtnClass: 'btn btn-default', // you class for styling the cancel button
      animation: 'fadeInUp' // 'fadeInLeft', 'fadeInRight', 'fadeInUp', 'bounceIn','bounceInDown'
    };
  }
  ngOnInit() {
    // on page load show all the employee's appointements of todays's date.
    // If all are selected in stylist then only one day appointements of all stylist will be shown.
    this.createInitialTableHeader();
    this.data = {
      dates: [{ id: '1', value: '00:00' },
      { id: '2', value: '01:00' },
      { id: '3', value: '02:00' },
      { id: '4', value: '03:00' },
      { id: '5', value: '04:00' },
      { id: '6', value: '05:00' },
      { id: '7', value: '06:00' },
      { id: '8', value: '07:00' },
      { id: '9', value: '08:00' },
      { id: '10', value: '09:00' },
      { id: '11', value: '10:00' },
      { id: '12', value: '11:00' },
      { id: '13', value: '12:00' },
      { id: '14', value: '13:00' },
      { id: '15', value: '14:00' },
      { id: '16', value: '15:00' },
      { id: '17', value: '16:00' },
      { id: '18', value: '17:00' },
      { id: '19', value: '18:00' },
      { id: '20', value: '19:00' },
      { id: '21', value: '20:00' },
      { id: '22', value: '21:00' },
      { id: '23', value: '22:00' },
      { id: '24', value: '23:00' }
      ], data1: `<div class="checkIn" >Irfan <span class="iconcheckin" style="float: right;">
      <i class="fa fa-calendar-check-o fa-lg" aria-hidden="true"></i></span><span class="th1" style="display: block;">
      Hair Cutting 00:00 - 00:30 </span></div><div class="notconfirmed" >Manish <span class="iconcheckin" style="float: right;">
      <i class="fa fa-calendar-times-o fa-lg" aria-hidden="true"></i></span><span class="th1" style="display: block;">
      Hair Dryings 00:30 - 01:30 </span></div>`, data2: '19/12/2017_00:30', data3: '', data4: '', data5: ''
    };
    //  console.log(this.stylists.length);

    // this.createDatesData();
    //  this.getAllStylists();
  }

  showModel() {

    this._modal.open(FlightControlDialog, overlayConfigFactory({}, FlightControlDialogData))
      .then(p => {
        p.result.then(r => {
          console.log(r);

        });
      })
    // const dialogRef = this._modal.alert()
    //   .size('lg')
    //   .inElement(true)
    //   .showClose(true)
    //   .title('A simple Alert style modal window')
    //   .body(`
    //         <h4>Alert is a classic (title/body/footer) 1 button modal window that 

    //         does not block.</h4>    <button class="btn">ll</button>asdasd
    //         <b>Configuration:</b>
    //         <ul>
    //             <li>Non blocking (click anywhere outside to dismiss)</li>
    //             <li>Size large</li>
    //             <li>Dismissed with default keyboard key (ESC)</li>
    //             <li>Close wth button click</li>
    //             <li>HTML content</li>
    //         </ul>`)
    //   .open();

    // dialogRef
    //   .then(result => alert(`The result is: ${result}`));
  }
  pp() {
    console.log('working');
  }
  createInitialTableHeader() {
    // console.log(this.api_url);
    this._employeeService.getAllEmployees().subscribe(
      stylists => {
        this.stylists = stylists;
        this.stylists = this.stylists.filter(x => x.stylist === true);
        this.tableHeader.length = 0;
        for (let j = 0; j < this.stylists.length; j++) {
          const startDate = new Date(this.selDate.year, this.selDate.month - 1, this.selDate.day);
          const stylistPic = this.stylists[j].image === null ? './assets/img/avatar04.png' : this.api_url + this.stylists[j].image;
          if (j === 0) {
            this.tableHeader.push('<div class="thdate">' + 'Dates' + '</div>');

            this.tableHeader.push(
              this._sanitizer.bypassSecurityTrustHtml(
                '<div class="col-md-6 text-right">' + '<img class="stylist-image"  src=" ' + stylistPic + '  " height="37px" alt="image" </a>' + '</div>' +
                '<div class="col-md-6 text-left">' +
                '<div class="thstylist">' + this.stylists[j].name + '</div><div class="th1">' + moment(startDate).format('DD/MM/YYYY') + '</div></div>')
            );
          } else {

            this.tableHeader.push(
              this._sanitizer.bypassSecurityTrustHtml(
                '<div class="col-md-6 text-right">' + '<img class="stylist-image" src=" ' + stylistPic + '  " height="37px" alt="image" </a>' + '</div>' +
                '<div class="col-md-6 text-left">' +
                '<div class="thstylist">' + this.stylists[j].name + '</div><div class="th1">' + moment(startDate, ).format('DD/MM/YYYY') + '</div></div>'));
          }

        }
        //  this.createDatesData();
      },
      err => { }
    );
  }
  getAllStylists() {
    this._employeeService.getAllEmployees().subscribe(
      stylists => {
        this.stylists = stylists;
        this.stylists = this.stylists.filter(x => x.stylist === true);

      },
      err => { }
    );
  }
  getAllCustomers() {
    this._customerService.getAllCustomers().subscribe(
      res => {
        this.customers = res;
      },
      err => { }
    );
  }
  viewChange(value) {
    if (value === true) {
      this.getAllAppointements();
    } else {
      this.updateDom();
    }
  }

  updateDom() {
    this._appointmentService.getallAppointments().subscribe(
      data => {
        this.appointements = data;
        this.directive.bindDataToDom(this.appointements, this.employee);
      },
      err => { }
    );
  }
  getAllAppointements() {
    this._appointmentService.getallAppointments().subscribe(
      data => {
        this.appointements = data;
        //  console.log(this.appointements);
      },
      err => { }
    );
  }
  tdDates() {
    const tempArr = [];
    console.log(this.employee);
    const startDate = new Date(this.selDate.year, this.selDate.month - 1, this.selDate.day);
    if (this.employee === "All") {
      for (let j = 0; j < this.stylists.length; j++) {

        tempArr.push(this.stylists[j].id + '_' + moment(startDate).format('DD/MM/YYYY'));
      }
    } else {
      for (let j = 0; j < this.days; j++) {
        tempArr.push(0 + '_' + moment(this.addDays(startDate, j)).format('DD/MM/YYYY'));
      }
    }

    return tempArr;
  }

  createDatesData() {
    // const tableData;
    this.tableData.length = 0;
    console.log(this.data.dates);
    for (let k = 0; k < this.data.dates.length; k++) {

      this.tableData.push({ ['' + this.data['dates'][k].value + '']: this.tdDates() });

    }
    this.updateDom();
    setTimeout(() => {
      this.spinner = false;
    }, 1000);

    console.log(this.tableData);
  }

  onDateChanged(event: IMyDateModel) {
    // Update value of selDate variable
    this.selDate = event.date;
  }


  addAppointment(event: any) {
    // console.log(event);
    this.popup.show();
  }
  saveAppointment() {

  }

  createtableHeader() {
    this.tableHeader.length = 0;

    // console.log(this.tableHeader);
    for (let j = 0; j < this.days; j++) {
      console.log(this.days);
      const currentstylist = this.stylists.filter(x => x.name === this.employee)[0];
      console.log(currentstylist);
      const stylistPic = currentstylist.image === null ? './assets/img/avatar04.png' : this.api_url + currentstylist.image;
      // const newDate = this.date1;
      const startDate = new Date(this.selDate.year, this.selDate.month - 1, this.selDate.day);
      //  console.log(startDate);
      if (j === 0) {
        this.tableHeader.push('Dates');
        this.tableHeader.push(this._sanitizer.bypassSecurityTrustHtml(
          '<div class="col-md-6 text-right">' + '<img class="stylist-image"  src=" ' + stylistPic + '  " height="37px" alt="image" </a>' + '</div>' +
          '<div class="col-md-6 text-left">' +
          '<div class="thstylist">' + currentstylist.name + '</div><div class="th1">' + moment(this.addDays(startDate, j)).format('DD/MM/YYYY') + '</div></div>')
        );
        // this.tableHeader.push('<div class="thstylist">' + currentstylist.name + '</div><div class="th1">' + moment(this.addDays(startDate, j)).format('DD/MM/YYYY') + '</div>');
      } else {
        this.tableHeader.push(this._sanitizer.bypassSecurityTrustHtml(
          '<div class="col-md-6 text-right">' + '<img class="stylist-image"  src=" ' + stylistPic + '  " height="37px" alt="image" </a>' + '</div>' +
          '<div class="col-md-6 text-left">' +
          '<div class="thstylist">' + currentstylist.name + '</div><div class="th1">' + moment(this.addDays(startDate, j)).format('DD/MM/YYYY') + '</div></div>')
        );
        // this.tableHeader.push('<div class="thstylist">' + currentstylist.name + '</div><div class="th1"> ' + moment(this.addDays(startDate, j)).format('DD/MM/YYYY') + '</div>');
        // startDate = new Date();
      }
      //  startDate.setFullYear(this.date1.getFullYear(), this.date1.getMonth(), this.date1.getDate());
      //  console.log(this.tableHeader);
      this.tableData.length = 0;
      this.createDatesData();
    }
  }

  ngAfterViewInit(): void {
    const ID = '19/12/2017_00:30';
    // console.log($('[id="' + ID + '"]').html());
    // console.log(this.stylists);
    //  this.directive.bindDataToDom(this._appointmentService.getallAppointments());
    this._eventEmiter.emitChange('Collapse in Dashbosrd Master');
    // $('#sidebar').trigger('click');
    //    this.popup.show();
    if (this.tableView === true) {
      this.getAllAppointements();
    }

  }

  Add() {
    $('#' + this.i).append('<button (click)="ItsAn()" >Angular click</button>');
    this.elRef.nativeElement.querySelector('0').addEventHandler('click', this.onClick.bind(this));
    this.i++;
  }
  addDays(date: Date, days: number): Date {
    const newDate = new Date(this.selDate.year, this.selDate.month - 1, this.selDate.day);
    // console.log(date.getDate());
    newDate.setDate(date.getDate() + days);
    return newDate;
  }
  onClick(event) {
    // console.log(event);
  }
  Show() {
    this.spinner = true;
    if (this.employee === 'All') {
      console.log('All Employee');
      this.tableData.length = 0;
      this.createInitialTableHeader();
    } else {
      this.date1.setFullYear(this.selDate.year, this.selDate.month - 1, this.selDate.day);
      this.createtableHeader();
    }
    //console.log(this.date1);

    //console.log(this.selDate.month);



    // this.spinner = false;
  }
  stylistChange() {

  }
  getAppointmentDetails(formData: any) {
    // console.log(formData);
    if (formData['action'] === 'save') {
      const arr: Appointments[] = [];
      // arr.push(formData);
      // this.directive.AddDom(formData);
      this.spinner = true;
      this.updateDom();
      setTimeout(() => {
        this.spinner = false;
      }, 1000);
    }
    if (formData['action'] === 'update') {
      this.spinner = true;
      this.updateDom();
      setTimeout(() => {
        this.spinner = false;
      }, 1000);
    }
    this.popup.hide();
    // if (appointmentData.action === 'save') {
    //   // console.log(appointmentData.appointmentDate);
    //   //  console.log(appointmentData.AppComponentTime);
    //   //  console.log(appointmentData.action);
    //   this.getBlock(appointmentData.appointmentDate, appointmentData.AppComponentTime);
    //   this.popToast('Schedule Save Successfully!!', '');
    //   this.popup.hide();


    // } else {
    //   console.log(appointmentData.action);
    //   this.popup.hide();
    // }

  }
  editAppointment(id: any) {
    // console.log('in ' + id);
    this._appointmentService.getAppointmentById(id).subscribe(
      data => {
        this.addAppointementComponent.updateForm(data);
        this.popup.show();
        window.scrollTo(0, 0);
      },
      err => { }
    );
  }
  getBlock(date: IMyDate, time: string) {
    const ID = '' + date.day + '/' + date.month + '/' + date.year + '_' + time.substring(1, 5) + '';
    //  console.log(ID);
  }
}
