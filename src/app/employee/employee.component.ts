import { Component, OnInit, Renderer, ViewChild, ElementRef } from '@angular/core';
import { IMyDpOptions } from 'mydatepicker';
import { Employee } from './employee';
import { ToasterConfig, Toast, BodyOutputType, ToasterService } from 'angular2-toaster';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from './employee.service';
import { CommonService } from '../shared/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { ItemService } from '../item/item.service';
import { CustomValidators } from '../shared/customevalidators';
import * as moment from 'moment';
declare var require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');
declare var jquery: any;
declare var $: any;
import { slideIn } from '../shared/animation';

@Component({
    selector: 'app-employee',
    templateUrl: './employee.component.html',
    styleUrls: ['./employee.component.css'],
    animations: [slideIn]
})
export class EmployeeComponent implements OnInit {
    show = false;
    model: any = '';
    doj: any = '';
    searchKey: any;
    sortCol: string;
    sortDir: string;
    queryParams: any;
    pageIndex = 1;
    ddlitemsPerPage: any;
    itemsPerPage = 10;
    totalItems = 0;
    last_page: number;
    employees: Employee[];
    employeePDF: Employee[];
    searchbox = '';
    employeeForm: FormGroup;
    serviceRate = 0;
    serviceList = [];
    itemIngredients: any;
    formEditMode = false;
    imageSrc = '../assets/img/product_img.jpg';
    @ViewChild('fileInput') fileInput: ElementRef;
    public myDatePickerOptions: IMyDpOptions = {
        dateFormat: 'dd/mm/yyyy',
        height: '28px'
    };
    nextRecordId = 0;
    public config1: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-top-right',
        showCloseButton: false,
        tapToDismiss: false,
        animation: 'fade',
        timeout: '2000'
    });
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
            title: 'Employee',
            body: message,
            bodyOutputType: BodyOutputType.TrustedHtml
        };

        this.toasterService.pop(toast);
    }
    constructor(private fb: FormBuilder, private toasterService: ToasterService,
        private routeService: ActivatedRoute, private employeeService: EmployeeService,
        private _commonService: CommonService, private _sanitizer: DomSanitizer,
        private _itemService: ItemService, private renderer: Renderer, ) {
        this.routeService.queryParams
            .filter(params => 'sort' in params)
            .map(params => params)
            .distinctUntilChanged()
            .subscribe(data => {
                this.sortCol = data['sort'];
                this.sortDir = data['dir'];
                this.getAllEmployees(this.itemsPerPage, this.pageIndex, '');
            });
        this.sortDir = 'asc';
        this.sortCol = 'id';
        this.ddlitemsPerPage = this.itemsPerPage;
        this.employeeForm = fb.group({
            id: [''],
            name: ['', [Validators.required, CustomValidators.nospaceValidator]],
            parentName: ['', CustomValidators.nospaceValidator],
            gander: [''],
            mobile: ['', [Validators.required, CustomValidators.mobileNumberValidate]],
            email: ['', CustomValidators.vaildEmail],
            birthday: [''],
            dateOfJoining: [''],
            department: ['', CustomValidators.nospaceValidator],
            position: ['', CustomValidators.nospaceValidator],
            pAddress: ['', [Validators.required, CustomValidators.nospaceValidator]],
            rAddress: ['', [Validators.required, CustomValidators.nospaceValidator]],
            active: [true],
            stylist: [false],
            image: [''],
            created_at: [''],
            updated_at: [''],
            employee_service_comm: this.fb.array([])
        });

    }
    ngOnInit() {
        this.getAllEmployees(this.itemsPerPage, this.pageIndex, '');
        this.getNextRecordIdOfTable();
    }
    handleChange(e) {
        const isChecked = e.target.checked;
        this.employeeForm.get('active').setValue(isChecked);
        console.log(isChecked);
    }
    setItemsPerPage() {
        this.itemsPerPage = this.ddlitemsPerPage;
        this.getAllEmployees(this.itemsPerPage, this.pageIndex, '');
    }
    onEnter(value: string) {
        this.getAllEmployees(this.itemsPerPage, this.pageIndex, value);
    }
    getPage(page: number) {
        this.pageIndex = page;
        this.getAllEmployees(this.itemsPerPage, this.pageIndex, '');
    }
    getAllEmployees(itemsPerPage: number, pageIndex: number, searchkey: any) {
        this.employeeService.getAllEmployee(itemsPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
            employee => {
                this.employees = employee['data'];
                this.totalItems = employee['total'];
                this.last_page = employee['last_page'];
            },
            err => { }
        );
    }
    autocompleListFormatter = (data: any) => {
        // let html = `<span style='width:68%; display: inline-block'>${data.productCode} </span>
        //  <span style='width:13%; display: inline-block'><i class="fa fa-inr"></i> ${data.itemName}</span>
        //  <span style='width:17%; display: inline-block'> <i class="fa fa-clock-o "></i> 5 </span>`;
        const html = `
     <span style='width:13%; display: inline-block'>${data.itemName}</span>
     `;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }
    getItemList(): FormArray {
        return <FormArray>this.employeeForm.controls['employee_service_comm'];
    }
    searchItem = (keyword: any): Observable<any[]> => {
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
    serviceSelected(ingredient) {

        if (typeof (ingredient) !== 'string') {
            console.log(this.serviceList.length);
            if (this.serviceList.length !== 0) {
                const duplicate = this.serviceList.filter(item => item.barcode === ingredient.barcode);
                if (duplicate.length !== 0) {
                    const index = this.serviceList.findIndex(x => x.barcode === duplicate[0].barcode);
                    console.log(this.serviceRate);
                    // console.log((this.serviceList[index]['stock']));
                    this.serviceRate = this.serviceRate;
                    this.itemIngredients = this.getItemList();
                    console.log(this.employeeForm.get('employee_service_comm'));
                    this.employeeForm.get(['employee_service_comm', index, 'comm_rate']).setValue(this.serviceRate);
                } else {
                    ingredient['comm_rate'] = this.serviceRate;
                    //  ingredient['deleted'] = false;
                    this.serviceList.push(ingredient);
                    this.itemIngredients = this.getItemList();
                    this.itemIngredients.push(this.addToItemCommissionList(ingredient));
                }
            } else {
                ingredient['comm_rate'] = this.serviceRate;
                // ingredient['deleted'] = false;
                //  console.log(ingredient['stock']);
                this.serviceList.push(ingredient);
                this.itemIngredients = this.getItemList();
                this.itemIngredients.push(this.addToItemCommissionList(ingredient));
            }
            this.searchbox = '';
            // console.log(this.serviceRate);
            // console.log(this.searchbox);
        }
        //  console.log(this.employeeForm.get('employee_service_comm').value);
    }
    addToItemCommissionList(item: any): FormGroup {
        // console.log(item);
        return this.fb.group({
            id: new FormControl(''),
            employeeId: new FormControl(''),
            itemObj: new FormControl(item),
            itemId: new FormControl(item.id),
            comm_rate: new FormControl(item.comm_rate, Validators.required),
            deleted: new FormControl(false)
        });
    }
    removeService(i: number) {
        this.serviceList.splice(i, 1);
        if (this.getItemList().at(i).get('id').value !== '') {
            this.getItemList().at(i).get('deleted').setValue(true);
        } else {
            this.getItemList().removeAt(i);
        }
        // this.getItemIngredientsList().removeAt(i);
    }
    onSubmit() {
        this.employeeForm.get('name').markAsDirty();
        this.employeeForm.get('mobile').markAsDirty();
        this.employeeForm.get('pAddress').markAsDirty();
        this.employeeForm.get('rAddress').markAsDirty();
        if (this.employeeForm.valid) {
            if (this.employeeForm.get('birthday').value !== '' && this.employeeForm.get('birthday').value !== null) {
                const birthdayDate = this.employeeForm.get('birthday').value.date;
                const bdate = moment(new Date(birthdayDate.year, birthdayDate.month - 1, birthdayDate.day)).format('YYYY-MM-DD');
                this.employeeForm.get('birthday').setValue(bdate);
            }
            const joiningDate = this.employeeForm.get('dateOfJoining').value;
            if (joiningDate !== '' && joiningDate !== null) {
                const dateofjoining = this.employeeForm.get('dateOfJoining').value.date;
                const jdate = moment(new Date(dateofjoining.year, dateofjoining.month - 1, dateofjoining.day)).format('YYYY-MM-DD');
                this.employeeForm.get('dateOfJoining').setValue(jdate);
            }
            if (!this.formEditMode) {
                // this.spinner = true;
                this.employeeService.addEmployee(this.employeeForm.value).subscribe(
                    res => {
                        // this.spinner = false;
                        if (res['status'] === 'success') {
                            this.popToast('Employee saved successfully', '');
                            this.resetForm();
                            this.getAllEmployees(this.itemsPerPage, this.pageIndex, '');
                        } else {
                            this.duplicateErrors(res);
                            this.dateFormate(this.employeeForm.get('birthday').value, this.employeeForm.get('dateOfJoining').value);
                        }
                    },
                    err => {
                        // this.spinner = false;
                        this.popToast('Unable to save Employee', '50');
                        // this.resetForm();
                    }
                );
            } else {
                const employeeId = this.employeeForm.get('id').value;
                // this.spinner = true;
                this.employeeService.updateEmployee(this.employeeForm.value, employeeId).subscribe(
                    res => {
                        // this.spinner = false;
                        if (res['status'] === 'success') {
                            this.formEditMode = false;
                            this.popToast('Employee Updated Successfully!!', '');
                            this.resetForm();
                            this.getAllEmployees(this.itemsPerPage, this.pageIndex, '');
                        } else {
                            this.duplicateErrors(res);
                            this.dateFormate(this.employeeForm.get('birthday').value, this.employeeForm.get('dateOfJoining').value);
                        }
                    },
                    err => {
                        //  this.spinner = false;
                        this.popToast('Unable to update employee!!', '50');
                        // this.resetForm();
                    }
                );
            }

        }
    }
    duplicateErrors(res: any) {
        let html = '<div>';
        // this.popToast(res.errors['mobile_no'], '51');
        if (res.errors['email']) {
            this.employeeForm.controls['email'].setErrors({
                'emailNotUnique': true
            });
            html += '<p style="color: red;">' + res.errors['email'] + '</p>';
        }
        if (res.errors['name']) {
            this.employeeForm.controls['name'].setErrors({
                'phoneNotUnique': true
            });
            html += '<p style="color: red;">' + res.errors['name'] + '</p>';
        }
        if (res.errors['mobile']) {
            this.employeeForm.controls['mobile'].setErrors({
                'mobileNotUnique': true
            });
            html += '<p style="color: red;">' + res.errors['mobile'] + '</p>';
        }
        if (res.errors['pAddress']) {
            this.employeeForm.controls['pAddress'].setErrors({
                'required': true
            });
            html += '<p style="color: red;">' + res.errors['pAddress'] + '</p>';
        }
        if (res.errors['rAddress']) {
            this.employeeForm.controls['rAddress'].setErrors({
                'required': true
            });
            html += '<p style="color: red;">' + res.errors['rAddress'] + '</p>';
        }
        html += '</div>';
        this.popToast(html, '51');
    }
    resetForm() {
        this.show = false;
        this.searchbox = ' ';
        this.serviceRate = null;
        this.formEditMode = false;
        this.employeeForm.reset();
        this.imageSrc = '../assets/img/product_img.jpg';
        this.getNextRecordIdOfTable();
        this.removeAllItemServices();
        this.resetIngredients();
        this.employeeForm.get('active').setValue(true);
        this.serviceList = [];
    }
    reset() {
        this.employeeForm.reset();
        this.removeAllItemServices();
        this.resetIngredients();
        this.imageSrc = '../assets/img/product_img.jpg';
        this.serviceList = [];
    }
    removeAllItemServices() {
        const itemIngredients = this.getItemList();
        for (let i = itemIngredients.controls.length - 1; i >= 0; i--) {
            itemIngredients.removeAt(i);
        }
    }
    getNextRecordIdOfTable() {
        this._commonService.getLastNextRecordId('employees').subscribe(
            res => {
                this.nextRecordId = res;
            },
            err => { }
        );
    }
    getEmployeeToEdit(id: number) {
        this.show = true;
        this.resetIngredients();
        this.employeeService.getEmployeeById(id).subscribe(
            item => {
                this.formEditMode = true;
                this.nextRecordId = item.id;
                this.setFormData(item);
                this.itemIngredients = this.getItemList();
                if (item['service_comm_rate'] !== null) {
                    item['service_comm_rate'].forEach(ing => {
                        this.itemIngredients.push(
                            this.fb.group({
                                id: new FormControl(ing.id),
                                employeeId: new FormControl(ing.employeeId),
                                itemObj: new FormControl(ing.service_item),
                                itemId: new FormControl(ing.itemId),
                                comm_rate: new FormControl(ing.comm_rate, Validators.required),
                                deleted: new FormControl(false),
                            })
                        );
                        this.serviceList.push(ing.service_item);
                    });
                    //  console.log(this.serviceList);
                }
                // console.log(this.itemForm.get('item_ingredients').value);
            },
            err => { }
        );
    }
    setFormData(employee: Employee) {
        this.employeeForm.get('id').setValue(employee.id);
        if (employee.image != null) {
            this.imageSrc = 'http://salonapi.sagarmutha.com/' + employee.image;
        }
        this.employeeForm.get('image').setValue(employee.image);
        this.employeeForm.get('name').setValue(employee.name);
        this.employeeForm.get('parentName').setValue(employee.parentName);
        this.employeeForm.get('gander').setValue(employee.gander);
        this.employeeForm.get('mobile').setValue(employee.mobile);
        this.employeeForm.get('email').setValue(employee.email);
        // this.employeeForm.get('dateOfJoining').setValue(employee.dateOfJoining);
        // this.employeeForm.get('birthday').setValue(employee.birthday);
        this.employeeForm.get('department').setValue(employee.department);
        this.employeeForm.get('position').setValue(employee.position);
        this.employeeForm.get('pAddress').setValue(employee.pAddress);
        this.employeeForm.get('rAddress').setValue(employee.rAddress);
        this.employeeForm.get('active').setValue(employee.active);
        this.employeeForm.get('stylist').setValue(employee.stylist);
        this.dateFormate(employee.birthday, employee.dateOfJoining);
    }
    dateFormate(bdate: string, dtJoining: string) {
        const birthdaydate = new Date(bdate);
        const jioningdate = new Date(dtJoining);
        this.employeeForm.patchValue({
            birthday: bdate !== null && bdate !== '' ? {
                date: {

                    year: birthdaydate.getFullYear(),
                    month: birthdaydate.getMonth() + 1,
                    day: birthdaydate.getDate()

                }
            } : '',
            // anniversary: [custdata.anniversary],
            dateOfJoining: dtJoining !== null && dtJoining !== '' ? {
                date: {
                    year: jioningdate.getFullYear(),
                    month: jioningdate.getMonth() + 1,
                    day: jioningdate.getDate()
                }

            } : '',
        });
    }
    resetIngredients() {
        const items = this.employeeForm.get('employee_service_comm') as FormArray;
        for (let i = items.controls.length - 1; i >= 0; i--) {
            items.removeAt(i);
        }
    }
    fileUpload(event) {

        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            const file: File = fileList[0];
            const formData: FormData = new FormData();
            formData.append('photo', file, file.name);
            this._itemService.itemImageUpload(formData).subscribe(
                data => {
                    this.imageSrc = 'http://salonapi.sagarmutha.com/' + data;
                    this.employeeForm.get('image').setValue(data);
                    console.log('uploaded');
                },
                err => { console.log('upload error'); }
            );
        }
    }
    openFileUploadDialig() {
        const event = new MouseEvent('click', { bubbles: true });
        this.renderer.invokeElementMethod(
            this.fileInput.nativeElement, 'dispatchEvent', [event]);
    }
    generatePDF() {
        this.employeeService.getAllEmployees().subscribe(
            res => {
                this.employeePDF = res;
                this.exportToPDF();
            }
        );
    }
    exportToPDF() {
        const columns = [
            { title: 'Employee No', dataKey: 0 },
            { title: 'Name', dataKey: 1 },
            { title: 'Mobile', dataKey: 2 },
            { title: 'Email', dataKey: 3 }
        ];
        const rows = [];
        this.employeePDF.forEach(employee => {
            rows.push({
                0: employee.id, 1: employee.name === null ? '' : employee.name,
                2: employee.mobile === null ? '' : employee.mobile,
                3: employee.email === null ? '' : employee.email,
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
                doc.text('Employee ', doc.internal.pageSize.width / 2, 35, 'center');
            }
        });
        doc.save('Employee.pdf');
    }
    deleteEmployee(id: string) {
        this.employeeService.deleteEmployee(id).subscribe(res => {
            this.popToast('Employee deleted successfully !!', '');
            this.getAllEmployees(this.itemsPerPage, this.pageIndex, '');
        }, err => {
            this.popToast('Unable to delete employee', '50');
            this.getAllEmployees(this.itemsPerPage, this.pageIndex, '');
        });
    }
}


