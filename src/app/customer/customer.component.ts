import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MyDatePickerModule, IMyDpOptions } from 'mydatepicker';
import { CustomerService } from './customer.service';
import { Customer } from './customer';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ToasterService, BodyOutputType, Toast, ToasterConfig } from 'angular2-toaster';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { CustomValidators } from '../shared/customevalidators';
import { CommonService } from '../shared/common.service';
declare var require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');
declare var jquery: any;
declare var $: any;
import { slideIn } from '../shared/animation';

@Component({
    selector: 'app-customer',
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.css'],
    animations: [slideIn]
})
export class CustomerComponent implements OnInit, AfterViewInit {

    show = false;
    tempArr: number[] = [1, 2, 3];
    model: any = '';
    anniversarydate: any = '';
    form: FormGroup;
    customers: Customer[];
    customersPDF: Customer[];
    formEditMode = false;
    formToggleOpen = false;
    editId: string;
    searchKey: any;
    sortCol: string;
    sortDir: string;
    queryParams: any;
    pageIndex = 1;
    ddlitemsPerPage: any;
    itemsPerPage = 10;
    totalItems = 0;
    last_page: number;
    vaildationError: string[];
    nextRecordId = 0;
    public config1: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-top-right',
        showCloseButton: false,
        tapToDismiss: false,
        animation: 'fade',
        timeout: '2000'
    });
    public myDatePickerOptions: IMyDpOptions = {
        dateFormat: 'dd/mm/yyyy',
        height: '28px',
    };
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
            title: 'Customer',
            body: message,
            bodyOutputType: BodyOutputType.TrustedHtml
        };

        this.toasterService.pop(toast);
    }

    constructor(private fb: FormBuilder, private toasterService: ToasterService,
        private routeService: ActivatedRoute, private customerService: CustomerService,
        private _commonService: CommonService) {
        this.routeService.queryParams
            .filter(params => 'sort' in params)
            .map(params => params)
            .distinctUntilChanged()
            .subscribe(data => {
                this.sortCol = data['sort'];
                this.sortDir = data['dir'];
                this.getAllCustomers(this.itemsPerPage, this.pageIndex, '');
            });
        this.sortDir = 'asc';
        this.sortCol = 'id';
        this.ddlitemsPerPage = this.itemsPerPage;
        this.form = fb.group({
            'title': ['1'],
            'name': ['', [Validators.required, CustomValidators.nospaceValidator]],
            'spouse': ['', CustomValidators.nospaceValidator],
            'birthday': [''],
            'anniversary': [''],
            'address': ['', [Validators.required, CustomValidators.nospaceValidator]],
            'phone': ['', [CustomValidators.phoneNumberValidatorifnotempty]],
            'mobile': ['', [Validators.required, CustomValidators.mobileNumberValidate, Validators.maxLength(10)]],
            'fax': ['', [CustomValidators.onlyNumericValidateifnotempty]],
            'email': ['', CustomValidators.vaildEmail],
            'city': ['', CustomValidators.nospaceValidator],
            'nationality': ['', CustomValidators.nospaceValidator],
        });
        // this.dateFormate(this.form.get('birthday').value, this.form.get('anniversary').value);
        // console.log(this.form.get('birthday').value);
        // console.log(this.form.get('anniversary').value);
    }
    ngOnInit() {
        this.getAllCustomers(this.itemsPerPage, this.pageIndex, '');
        this.getNextRecordIdOfTable();
    }
    ngAfterViewInit(): void {
        console.log(this.form.get('birthday').value);
        console.log(this.form.get('anniversary').value);
    }

    setItemsPerPage() {
        this.itemsPerPage = this.ddlitemsPerPage;
        this.getAllCustomers(this.itemsPerPage, this.pageIndex, '');
    }
    onEnter(value: string) {
        this.getAllCustomers(this.itemsPerPage, this.pageIndex, value);
    }
    getPage(page: number) {
        this.pageIndex = page;
        this.getAllCustomers(this.itemsPerPage, this.pageIndex, '');
    }
    getAllCustomers(itemsPerPage: number, pageIndex: number, searchkey: any) {
        this.customerService.getAllCustomer(itemsPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
            res => {
                this.customers = res['data'];
                this.totalItems = res['total'];
                this.last_page = res['last_page'];
            },
            err => {
                console.log('error');
            }
        );
    }
    dateFormate(bdate: string, adate: string) {
        const birthdaydate = new Date(bdate);
        const anniversarydate = new Date(adate);
        this.form.patchValue({
            birthday: bdate !== null && bdate !== '' ? {
                date: {

                    year: birthdaydate.getFullYear(),
                    month: birthdaydate.getMonth() + 1,
                    day: birthdaydate.getDate()

                }
            } : null,
            // anniversary: [custdata.anniversary],
            anniversary: adate !== null && adate !== '' ? {
                date: {
                    year: anniversarydate.getFullYear(),
                    month: anniversarydate.getMonth() + 1,
                    day: anniversarydate.getDate()
                }

            } : null,
        });
    }
    onSubmit() {
        console.log(this.form.get('birthday').value);
        console.log(this.form.get('anniversary').value);
        if (this.form.valid) {
            if (this.form.get('birthday').value !== '' && this.form.get('birthday').value !== null) {
                const birthdayDate = this.form.get('birthday').value.date;
                const bdate = moment(new Date(birthdayDate.year, birthdayDate.month - 1, birthdayDate.day)).format('YYYY-MM-DD');
                this.form.get('birthday').setValue(bdate);
            }
            const anivarsaryDate = this.form.get('anniversary').value;
            if (anivarsaryDate !== '' && anivarsaryDate !== null) {
                const anniversaryDate = this.form.get('anniversary').value.date;
                const adate = moment(new Date(anniversaryDate.year, anniversaryDate.month - 1, anniversaryDate.day)).format('YYYY-MM-DD');
                this.form.get('anniversary').setValue(adate);
            }
            if (!this.formEditMode === true) {
                this.customerService.addCustomer(this.form.value).subscribe(
                    res => {
                        if (res.status === 'inValid') {
                            this.duplicateErrors(res);
                            this.dateFormate(this.form.get('birthday').value, this.form.get('anniversary').value);

                        } else {
                            this.popToast('Customer saved successfully', '');
                            this.getAllCustomers(this.itemsPerPage, this.pageIndex, '');
                            this.formToggleOpen = false;
                            this.resetForm();
                        }
                    },
                    error => {
                        this.popToast('Unable to save customer', '50');
                        console.log(error);
                    }
                );
            } else {
                this.customerService.updateCustomers(this.form.value, this.editId).subscribe(
                    res => {
                        if (res.status === 'inValid') {
                            this.duplicateErrors(res);
                            this.dateFormate(this.form.get('birthday').value, this.form.get('anniversary').value);
                        } else {
                            this.popToast('Customer updated successfully !!', '');
                            this.getAllCustomers(this.itemsPerPage, this.pageIndex, '');
                            this.formToggleOpen = false;
                            this.formEditMode = false;
                            this.resetForm();
                        }
                    },
                    err => {
                        this.popToast('Unable to update customer', '50');
                        this.dateFormate(this.form.get('birthday').value, this.form.get('anniversary').value);
                        //  this.getAllCustomers(this.itemsPerPage, this.pageIndex, '');
                    }
                );
            }
        }
    }
    duplicateErrors(res: any) {
        let html = '<div>';
        // this.popToast(res.errors['mobile_no'], '51');
        if (res.errors['email']) {
            this.form.controls['email'].setErrors({
                'emailNotUnique': true
            });
            html += '<p style="color: red;">' + res.errors['email'] + '</p>';
        }
        if (res.errors['phone']) {
            this.form.controls['phone'].setErrors({
                'phoneNotUnique': true
            });
            html += '<p style="color: red;">' + res.errors['phone'] + '</p>';
        }
        if (res.errors['mobile']) {
            this.form.controls['mobile'].setErrors({
                'mobileNotUnique': true
            });
            html += '<p style="color: red;">' + res.errors['mobile'] + '</p>';
        }
        html += '</div>';
        this.popToast(html, '51');
    }
    getNextRecordIdOfTable() {
        this._commonService.getLastNextRecordId('customers').subscribe(
            res => {
                this.nextRecordId = res;
            },
            err => { }
        );
    }
    resetForm() {
        this.form.reset();
        this.show = false;
        this.formEditMode = false;
        this.getNextRecordIdOfTable();
    }
    reset() {
        this.form.reset();
    }
    getEditCustomer(id: string) {
        this.editId = id;
        this.show = true;
        this.formEditMode = true;
        this.customerService.getCustomerEdit(id).subscribe(custdata => {
            const bdate = new Date(custdata.birthday);
            const anniversarydate = new Date(custdata.anniversary);
            this.form.patchValue({
                title: custdata.title,
                name: custdata.name,
                spouse: custdata.spouse,
                address: custdata.address,
                phone: custdata.phone,
                mobile: custdata.mobile,
                fax: custdata.fax,
                email: custdata.email,
                city: custdata.city,
                nationality: custdata.nationality,
            });
            this.dateFormate(custdata.birthday, custdata.anniversary);
            console.log(this.form.get('birthday').value);
            console.log(this.form.get('anniversary').value);
        }, err => {
            console.log('error');
        });
    }
    deleteCustomer(id: string) {
        this.customerService.deleteCustomers(id).subscribe(res => {
            this.popToast('Customer deleted successfully !!', '');
            this.getAllCustomers(this.itemsPerPage, this.pageIndex, '');
        }, err => {
            this.popToast('Unable to delete customer', '50');
            this.getAllCustomers(this.itemsPerPage, this.pageIndex, '');
        });
    }
    generatePDF() {
        this.customerService.getAllCustomers().subscribe(
            res => {
                this.customersPDF = res;
                this.exportToPDF();
            }
        );
    }
    exportToPDF() {
        const columns = [
            { title: 'Customer No', dataKey: 0 },
            { title: 'Name', dataKey: 1 },
            { title: 'Mobile', dataKey: 2 },
            { title: 'Address', dataKey: 3 }
        ];
        const rows = [];
        this.customersPDF.forEach(customer => {
            rows.push({
                0: customer.id, 1: customer.name,
                2: customer.mobile,
                3: customer.address
            });
        });
        const doc = new jsPDF('p', 'pt');
        //  doc.setLineWidth(2);
        doc.rect(15, 15, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 40, 'S');
        // doc.rect(10, 12, 575, 818);
        doc.setFontSize(20);
        doc.autoTable(columns, rows, {
            theme: 'grid',
            drawHeaderCell: function (cell, data) {
                cell.styles.textColor = [255, 255, 255];
            },
            pageBreak: 'auto',
            columnStyles: {
                id: { fillColor: [255, 0, 0] }
            },
            addPageContent: function (data) {
                doc.text('Customer ', doc.internal.pageSize.width / 2, 35, 'center');
            }
        });
        doc.save('Customer.pdf');
    }
}
