import { Component, EventEmitter, Output, ViewChild, Input, OnInit } from '@angular/core';
import { MyDatePickerModule, IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';
import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CustomerService } from '../customer/customer.service';
import { Customer } from '../customer/customer';
import { ItemService } from '../item/item.service';
import { EmployeeService } from '../employee/employee.service';
import { Employee } from '../employee/employee';
import { Observable } from 'rxjs/Rx';
import { AppointmentService } from '../appointment/appointement.service';
import { ToasterService } from 'angular2-toaster';
import { CommonService } from '../shared/common.service';

@Component({
    selector: 'app-add-appointment',
    templateUrl: './add-appointment.component.html',
    styleUrls: ['./add-appointment.component.css']
})
export class AddAppointmentComponent implements OnInit {

    @ViewChild('apptime') selectedTime: any;
    @Input() editFormData: any;
    form: FormGroup;
    items: FormArray;
    serviceList = [];
    totalCost = 0;
    customers: Customer[] = [];
    stylists: Employee[] = [];
    dateTo = new Date();
    selectedStylist: Employee;
    selectedCustomer: Customer;
    formEditMode = false;
    public services = [{
        id: 1,
        appointmentTime: '00:15',
        name: 'Hair Spa',
        amount: '415',
        time: '30',
        stylist: 'Manish'
    }, {
        id: 2,
        appointmentTime: '00:45',
        name: 'Hair Cutting',
        amount: '455',
        time: '70',
        stylist: 'Vicky'
    }];

    selectedService: any;
    defaultDate = new Date();
    nextServiceTime: any;
    service_time: any;
    lastServiceTime: any;
    nextAppointmentId: number;
    public myDatePickerOptions: IMyDpOptions = {
        dateFormat: 'dd/mm/yyyy',
        height: '28px',
    };
    searchbox: any;
    appointmmentDate: IMyDate = {
        year: this.defaultDate.getFullYear(), month: this.defaultDate.getMonth() + 1,
        day: this.defaultDate.getDate()
    };
    a2eOptions = { format: 'HH:mm' };
    Status = [{ name: 'Open', value: 'open' },
    { name: 'Check In', value: 'checkIn' },
    { name: 'Cancel', value: 'cancel' }, { name: 'Check Out', value: 'checkOut' }];
    @Output() passAppointmentDetails = new EventEmitter<FormGroup>();

    constructor(private fb: FormBuilder, private _sanitizer: DomSanitizer,
        private _customerService: CustomerService,
        private _itemService: ItemService,
        private _employeeService: EmployeeService,
        private _appointementSerice: AppointmentService,
        private _toasterService: ToasterService,
        private _commonService: CommonService) {
        this.getAllCustomers();
        this.getAllStylists();
        console.log(this.editFormData);
        // this.form.get('status').patchValue(this.editFormData);
    }
    ngOnInit(): void {
        this.form = this.fb.group({
            id: [],
            appointement_date: ['', Validators.required],
            appointmentTime: [''],
            customerId: [1],
            customer: [''],
            confirmed_by: [''],
            stylistId: ['', Validators.required],
            status: ['open'],
            totalCost: [0],
            serviceList: new FormArray([]),
            action: ['']
        });
        this.form.patchValue({
            appointmentDate: {
                date: this.appointmmentDate
            }
        });
        this.getNextRecordIdOfTable();
    }
    getNextRecordIdOfTable() {
        this._commonService.getLastNextRecordId('appointements').subscribe(
            res => {
                this.nextAppointmentId = res;
            },
            err => {
                console.log(err);
            }
        );
    }
    getAllCustomers() {
        this._customerService.getAllCustomers().subscribe(
            res => {
                this.customers = res;
            },
            err => {
                console.log('Unable to load customers');
            }
        );
    }
    getAllStylists() {
        this._employeeService.getAllEmployees().subscribe(
            res => {
                // get all employees which are stylists
                res = res.filter(sty => sty.stylist === true);
                this.stylists = res;
            },
            err => {
                console.log('Unable to load stylists');
            }
        );
    }

    searchServices = (keyword: any): Observable<any[]> => {
        if (keyword.length >= 2) {
            return this._itemService.searchIngredients(keyword, 'Product', 'itemName').map(
                res => {
                    const data = [];
                    res.forEach(element => {
                        data.push(element);
                    });
                    return data;
                },
                err => { }
            );
        } else {
            return Observable.of([]);
        }
    }

    pushToList(item: any) {

    }
    updateForm(data) {
        this.nextAppointmentId = data.id;
        this.formEditMode = true;
        this.resetServices();
        const date1 = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        const stillUtc = moment.utc(data.appointement_date).toDate();
        const appointement_date_to_local = moment(stillUtc).local();

        this.form.patchValue({
            id: data.id,
            status: data.status,
            appointement_date: {
                date: {
                    year: appointement_date_to_local.toDate().getFullYear(),
                    month: appointement_date_to_local.toDate().getMonth() + 1,
                    day: appointement_date_to_local.toDate().getDate()
                }
            },
            customerId: data.customerId,
            customer: data.customer,
            confirmed_by: data.confirmed_by,
            stylistId: data.stylistId,
            totalCost: data.totalCost
        });

        const control = this.getServiceList();
        this.selectedStylist = data.stylist;
        data['services'].forEach(service => {

            control.push(this.fb.group({
                id: new FormControl(service.id),
                started_on: new FormControl(this.utcToLocal(service.started_on)),
                end_on: new FormControl(this.utcToLocal(service.end_on)),
                status: new FormControl(service.status),
                appointementId: new FormControl(service.appointementId),
                serviceStylistId: new FormControl(data.stylist.id),
                itemId: new FormControl(service.id),
                itemName: new FormControl(service.service.itemName),
                amount: new FormControl(service.service.salePrice),
                serviceTime: new FormControl(service.service.serviceTime),
                stylist: new FormControl(data.stylist.name),
                deleted: new FormControl(false)
            }));
        });
        this.form.get('stylistId').disable();
        this.dateTo = moment(appointement_date_to_local).toDate();
        this.totalCost = data.totalCost;
        console.log(this.getServiceList().value);
    }
    utcToLocal(date: any): moment.Moment {
        const date1 = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        const stillUtc = moment.utc(date).toDate();
        date = moment(stillUtc).local().toDate();
        return date;
    }
    onSubmit(act: string) {
        console.log(this.form.value);
        this.form.get('stylistId').enable();
        const formdata = this.form.value;
        console.log(formdata);
        formdata.action = act;
        if (act === 'save') {
            this.form.value.appointmentTime = this.selectedTime.nativeElement.value;

            if (this.form.get('appointement_date').value !== '' && this.form.get('appointement_date').value !== null) {
                const temp_appdate = this.form.get('appointement_date').value.date;
                const startTime = formdata['serviceList'][0]['serviceTime'];
                console.log(Number(startTime.substr(0, 2)), Number(startTime.substr(3, 2)), Number(startTime.substr(6, 2)));
                const appdate = (new Date(temp_appdate.year, temp_appdate.month - 1, temp_appdate.day,
                    Number(startTime.substr(0, 2)), Number(startTime.substr(3, 2)), Number(startTime.substr(6, 2))
                ));
                console.log(formdata['serviceList'][0]['started_on']);
                formdata['appointement_date'] = moment(formdata['serviceList'][0]['started_on']).toDate();
            }

            if (!this.formEditMode) {
                this._appointementSerice.addAppointement(formdata).subscribe(
                    res => {
                        if (res['status'] === 'success') {
                            this._toasterService.pop({
                                type: 'success', title: 'Appointement',
                                body: res['msg']
                            });
                            formdata.id = res['id'];
                            this.passAppointmentDetails.emit(formdata);
                            this.totalCost = 0;
                            this.resetForm();
                        } else {
                            this._toasterService.pop({
                                type: 'warning', title: 'Appointement',
                                body: 'Invalid Data!!'
                            });
                        }

                    },
                    err => {
                        if (err['status'] === 'Error') {
                            this._toasterService.pop({
                                type: 'error', title: 'Appointement',
                                body: err['msg']
                            });
                        }
                        console.log('Unable to add!!');
                    }
                );
            } else {
                // update Appoinment
                const app_id = this.form.get('id').value;
                formdata.action = 'update';
                this._appointementSerice.updateAppointement(formdata, app_id).subscribe(
                    res => {
                        if (res['status'] === 'success') {
                            this._toasterService.pop({
                                type: 'success', title: 'Appointement',
                                body: res['msg']
                            });
                            formdata.id = res['id'];
                            this.passAppointmentDetails.emit(formdata);
                            this.totalCost = 0;
                            this.resetForm();
                        } else {
                            this._toasterService.pop({
                                type: 'warning', title: 'Appointement',
                                body: 'Invalid Data!!'
                            });
                        }

                    },
                    err => {
                        if (err['status'] === 'Error') {
                            this._toasterService.pop({
                                type: 'error', title: 'Appointement',
                                body: err['msg']
                            });
                        }
                        console.log('Unable to add!!');
                    }
                );
            }
        } else {
            this.formEditMode = false;
            this.passAppointmentDetails.emit(this.form.value);
            this.resetServices();
            this.resetForm();
        }
        // this.passAppointmentDetails.emit(this.form.value);


    }
    onappointmentDateChanged(event: IMyDateModel) {
        // Update value of selDate variable
        this.appointmmentDate = event.date;
        // console.log(this.appointmmentDate);
    }
    dateToChange(date) {
        this.dateTo = date;
    }
    dateChangeServices(val, j: number, i: number) {

        this.form.get(['serviceList', j, i]).setValue(moment(val._d).format('HH:mm'));
        // console.log(val);
        // console.log(moment(val._d).format('HH:mm'));
    }
    autocompleListFormatter = (data: any) => {
        const html = `<span style='width:68%; display: inline-block'>${data.itemName} </span>
         <span style='width:13%; display: inline-block'><i class="fa fa-inr"></i> ${data.salePrice}</span>
         <span style='width:17%; display: inline-block'> <i class="fa fa-clock-o "></i> ${data.serviceTime}</span>`;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }
    valueChanged(newVal) {

        this.selectedService = newVal;
        // console.log("Case 2: value is changed to ", newVal);
    }
    addServices() {
        this.form.get('appointement_date').markAsDirty();
        this.form.get('stylistId').markAsDirty();
        if (this.form.valid) {
            if (this.selectedService != null) {
                this.serviceStartTime();
                this.serviceList.push(this.selectedService);
                const control = this.getServiceList();
                console.log(this.nextServiceTime);
                const Temp = this.addMinutesToTime(moment(this.nextServiceTime).format('HH:mm'),
                    this.selectedService.serviceTime);
                //   const previousTime = this.nextServiceTime.toDate();
                const endTime = Temp;
                // endTime.setMinutes(
                //     previousTime.getMinutes() + )
                control.push(this.fb.group({
                    id: new FormControl(),
                    started_on: new FormControl(moment(this.nextServiceTime).toDate()),
                    end_on: new FormControl(moment(endTime).toDate()),
                    status: new FormControl(''),
                    appointementId: new FormControl(''),
                    serviceStylistId: new FormControl(this.selectedStylist.id),
                    itemId: new FormControl(this.selectedService.id),
                    itemName: new FormControl(this.selectedService.itemName),
                    amount: new FormControl(this.selectedService.salePrice),
                    serviceTime: new FormControl(this.selectedService.serviceTime),
                    stylist: new FormControl(this.selectedStylist.name),
                    deleted: new FormControl(false)
                }));
                // const amountToAdd = this.selectedService.salePrice;
                this.totalCost += Math.ceil(this.selectedService.salePrice * 100) / 100;
                this.totalCost = Math.ceil(this.totalCost * 100) / 100;
                this.form.get('totalCost').patchValue(this.totalCost);
                this.selectedService = null;
                this.searchbox = '';
                if (control.length >= 1) {
                    this.form.get('stylistId').disable();
                }
                console.log(this.form.value);
                console.log(this.nextServiceTime);
            }
            this.searchbox = '';
        }
    }
    resetServices() {
        const items = this.getServiceList();
        for (let i = items.controls.length - 1; i >= 0; i--) {
            items.removeAt(i);
        }
    }
    serviceStartTime() {

        if (this.getServiceList().length === 0) {
            const dateTo = moment(this.dateTo).toDate();
            const date = this.form.get('appointement_date').value.date;
            const appointement_date = new Date(date.year, date.month - 1, date.day,
                dateTo.getHours(), dateTo.getMinutes(), dateTo.getSeconds());
            // let appdate = moment(new Date(appointement_date.year, appointement_date.month - 1,
            //     appointement_date.day));
            console.log(appointement_date);
            this.nextServiceTime = moment(appointement_date);

        } else {

            const serviceLength = this.getServiceList().length - 1;
            console.log(serviceLength - 1);
            // this.lastServiceTime = this.getServiceList().at(serviceLength).value['started_on'];
            // this.service_time = (this.getServiceList().at(serviceLength).value['serviceTime']);
            console.log(this.getServiceList().at(serviceLength).value['end_on']);
            this.nextServiceTime = this.getServiceList().at(serviceLength).value['end_on'];
            // for (let j = 0; j <= this.getServiceList().length - 1; j++) {
            //     this.lastServiceTime = this.getServiceList().at(j).value['started_on'];
            //     this.service_time = (this.getServiceList().at(j).value['serviceTime']);
            // }
            // let hh = moment(this.nextServiceTime).format('HH');
            // let mm = moment(this.nextServiceTime).format('mm');
            // let h = parseInt(this.lastServiceTime.getHours());
            // h = h + parseInt(this.service_time.substr(0, 2));
            // let m = parseInt(this.lastServiceTime.getMinutes());
            // m = m + parseInt(this.service_time.substr(3, 6));
            // let hours: any = m / 60;
            // m = m % 60;
            // h += parseInt(hours);
            // this.nextServiceTime = moment().set({ hour: h, minute: m, second: 0, millisecond: 0 });
        }
    }
    addMinutesToTime(time: string, timeToAdd: string): any {
        console.log(time, timeToAdd);
        let h = parseInt(time.substr(0, 2));
        h = h + parseInt(timeToAdd.substr(0, 2));
        let m = parseInt(time.substr(3, 6));
        m = m + parseInt(timeToAdd.substr(3, 6));
        let hours: any = m / 60;
        m = m % 60;
        h += parseInt(hours);
        return moment().set({ hour: h, minute: m, second: 0, millisecond: 0 });
    }

    getStylistDetails(stylistId: number) {
        this._employeeService.getEmployeeById(stylistId).subscribe(
            stylist => {
                this.selectedStylist = stylist;
            },
            err => { }
        );
    }
    getCustomerDetails(customerId: string) {
        this._customerService.getCustomerEdit(customerId).subscribe(
            customer => {
                this.selectedCustomer = customer;
                this.form.get('customer').patchValue(this.selectedCustomer.name);
            },
            err => { }
        );
    }
    getServiceList(): FormArray {
        return <FormArray>this.form.controls['serviceList'];
    }
    removeService(i: number) {
        // console.log(this.totalCost);
        //  console.log(this.getServiceList().at(i).value['amount']);
        this.totalCost -= this.getServiceList().at(i).value['amount'];
        // console.log(this.totalCost);
        // this.totalCost = Math.ceil(this.totalCost * 100) / 100;

        // get time of service to be deleted
        const deleteServiceTime = (this.getServiceList().at(i).value['serviceTime']).toString();

        console.log(deleteServiceTime);
        for (let j = 0; j <= this.getServiceList().length - 1; j++) {

            if (i < j) {
                // console.log(typeof this.getServiceList().at(j).value[0]);
                // need to change time of all services after deleting item index,
                // taken the startTime of next service

                if (this.getServiceList().at(j).value['deleted'] === false) {
                    const nextServiceStartedOn = moment(this.getServiceList().at(j).value['started_on']).toDate();
                    nextServiceStartedOn.setHours(nextServiceStartedOn.getHours() - parseInt(deleteServiceTime.substr(0, 2)));
                    nextServiceStartedOn.setMinutes(nextServiceStartedOn.getMinutes() - parseInt(deleteServiceTime.substr(3, 6)));
                    nextServiceStartedOn.setSeconds(0);

                    const nextServiceEndOn = moment(this.getServiceList().at(j).value['end_on']).toDate();
                    nextServiceEndOn.setHours(nextServiceEndOn.getHours() - parseInt(deleteServiceTime.substr(0, 2)));
                    nextServiceEndOn.setMinutes(nextServiceEndOn.getMinutes() - parseInt(deleteServiceTime.substr(3, 6)));
                    nextServiceEndOn.setSeconds(0);

                    //  console.log(this.getServiceList().at(j));
                    this.getServiceList().at(j).get('started_on').setValue(nextServiceStartedOn);
                    this.getServiceList().at(j).get('end_on').setValue(nextServiceEndOn);
                }
                // // get hours of next service
                // let nextHour = parseInt(nextTime.substr(0, 2));
                // nextHour -= parseInt(deleteServiceTime.substr(0, 2));
                // console.log(nextHour);
                // // get minutes of next service
                // let nextMinutes = parseInt(nextTime.substr(3, 6));
                // console.log(nextMinutes);
                // // substract the deleting service time from next all services startingTime
                // nextMinutes -= parseInt(deleteServiceTime.substr(3, 6));

                // if (nextMinutes >= 0) {
                //     console.log(nextHour, nextMinutes);
                //     this.getServiceList().at(j).value['started_on'] = (nextHour + ':' + nextMinutes);
                // } else {
                //     nextMinutes = 60 - nextMinutes;
                //     const hours: any = nextMinutes / 60;
                //     nextMinutes = nextMinutes % 60;
                //     nextMinutes = 60 - nextMinutes;
                //     nextHour -= parseInt(hours);
                //     console.log(nextHour, nextMinutes);
                //     this.getServiceList().at(j).value['started_on'] = (nextHour + ':' + nextMinutes);
                // }
            }
        }
        this.form.get('totalCost').patchValue(this.totalCost);
        // this.getServiceList().removeAt(i);
        this.searchbox = '';
        if (this.getServiceList().length === 0) {
            this.form.get('stylistId').enable();
        }
        console.log(this.getServiceList().at(i).get('id').value);
        if (this.getServiceList().at(i).get('id').value !== null) {
            this.getServiceList().at(i).get('deleted').setValue(true);
        } else {

            this.getServiceList().removeAt(i);
        }
        console.log(this.getServiceList());
    }
    dateClick() {
    }
    resetForm() {
        this.form.reset();
        this.ngOnInit();
        this.dateTo = new Date();
    }
}
