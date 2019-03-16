import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, DialogServiceConfig, DialogComponent } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ElementRef, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Supplier } from './supplier';
import { ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { ToasterService } from 'angular2-toaster/src/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { SupplierService } from './supplier.service';
import { CustomValidators } from '../shared/customevalidators';
declare var require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');
declare var jquery: any;
declare var $: any;
import { slideIn } from '../shared/animation';
import { CommonService } from '../shared/common.service';
export interface ConfirmModel {
  title: string;
  message: string;
}

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css'],
  animations: [slideIn]
})
export class SupplierComponent extends DialogComponent<ConfirmModel, any> implements OnInit, ConfirmModel {
  @ViewChild('dataContainer') dataContainer: ElementRef;
  show = false;
  disposable: any;
  title: string;
  message: any;
  form: FormGroup;
  suppliers: Supplier[];
  suppliersPDF: Supplier[];
  formEditMode = false;
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
    timeout: 1500
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
      title: 'Supplier',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };

    this.toasterService.pop(toast);
  }
  constructor(private fb: FormBuilder, dialogService: DialogService, private rd: ElementRef, private sanitizer: DomSanitizer,
    private toasterService: ToasterService, private routeService: ActivatedRoute,
    private supplierService: SupplierService, private _commonService: CommonService) {
    super(dialogService);
    this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getAllSuppliers(this.itemsPerPage, this.pageIndex, '');
      });
    this.sortDir = 'asc';
    this.sortCol = 'id';
    this.ddlitemsPerPage = this.itemsPerPage;
    this.form = fb.group({
      'type': ['Supplier'],
      'title': ['1'],
      'company_name': ['', [Validators.required, CustomValidators.nospaceValidator]],
      'contact': [''],
      'address': ['', CustomValidators.nospaceValidator],
      'office_no': ['', CustomValidators.phoneNumberValidatorifnotempty],
      'mobile_no': ['', CustomValidators.mobileNumberValidate],
      'fax': ['', [CustomValidators.onlyNumericValidateifnotempty]],
      'email': ['', CustomValidators.vaildEmail],
      'city': ['', CustomValidators.nospaceValidator],
      'ecc_no': ['', [CustomValidators.nospaceValidator, CustomValidators.onlyNumericValidateifnotempty]],
      'cst_no': ['', [CustomValidators.nospaceValidator, CustomValidators.onlyNumericValidateifnotempty]],
      'range_no': ['', [CustomValidators.nospaceValidator]],
      'division': ['', [CustomValidators.nospaceValidator]],
      'comm': ['', [CustomValidators.nospaceValidator]],
      'pan_no': ['', [CustomValidators.nospaceValidator]],
      'tin_no': ['', [CustomValidators.nospaceValidator]],
      'account_grp': ['']
    });
  }
  confirm() {
    // we set dialog result as true on click on confirm button,
    // then we can get dialog result from caller code
    this.result = true;
    this.close();
  }
  showConfirm() {
    // const data = this.rd.nativeElement.querySelector('#tttt');
    // const data = this.dataContainer.nativeElement.innerHTML;
    // console.log(data);
    this.disposable = this.dialogService.addDialog(ConfirmComponent, {
      title: 'Confirmation',
      message: 'Are you Sure ?'
    }, {})
      .subscribe((isConfirmed) => {
        // We get dialog result
        if (isConfirmed) {
          alert('accepted');
        } else {
          alert('declined');
        }
      });
    // We can close dialog calling disposable.unsubscribe();
    // If dialog was not closed manually close it by timeout
    // setTimeout(() => {
    //   disposable.unsubscribe();
    // }, 10000);
  }
  got() {
    this.disposable.unsubscribe();
  }

  ngOnInit() {
    this.getAllSuppliers(this.itemsPerPage, this.pageIndex, '');
    this.getNextRecordIdOfTable();
  }
  setItemsPerPage() {
    this.itemsPerPage = this.ddlitemsPerPage;
    this.getAllSuppliers(this.itemsPerPage, this.pageIndex, '');
  }
  onEnter(value: string) {
    this.getAllSuppliers(this.itemsPerPage, this.pageIndex, value);
  }
  getPage(page: number) {
    this.pageIndex = page;
    this.getAllSuppliers(this.itemsPerPage, this.pageIndex, '');
  }
  getAllSuppliers(suppliersPerPage: number, pageIndex: number, searchkey: any) {
    this.supplierService.getAllSupplier(suppliersPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
      res => {
        this.suppliers = res['data'];
        this.totalItems = res['total'];
        this.last_page = res['last_page'];
      },
      err => {
        console.log('error');
      }
    );
  }
  getNextRecordIdOfTable() {
    this._commonService.getLastNextRecordId('suppliers').subscribe(
      res => {
        this.nextRecordId = res;
      },
      err => { }
    );
  }
  onSubmit() {
    if (this.form.valid) {
      if (!this.formEditMode === true) {
        console.log(this.form.value);
        this.supplierService.addSupplier(this.form.value).subscribe(
          res => {
            if (res.status == 'inValid') {
              this.duplicateErrors(res);
            } else {
              this.popToast('supplier saved successfully', '');
              this.getAllSuppliers(this.itemsPerPage, this.pageIndex, '');

              this.resetForm();
            }
          },
          error => {

            this.popToast('unable to supplier save', '50');
          }
        );
      } else {
        this.supplierService.updateSupplier(this.form.value, this.editId).subscribe(
          res => {
            if (res.status === 'inValid') {
              this.duplicateErrors(res);
            } else {
              this.popToast('supplier update successfully !!', '');
              this.getAllSuppliers(this.itemsPerPage, this.pageIndex, '');
              this.resetForm();
            }
          },
          err => {
            this.popToast('unable to supplier update', '50');
            this.getAllSuppliers(this.itemsPerPage, this.pageIndex, '');
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
    if (res.errors['office_no']) {
      this.form.controls['office_no'].setErrors({
        'phoneNotUnique': true
      });
      html += '<p style="color: red;">' + res.errors['office_no'] + '</p>';
    }
    if (res.errors['mobile_no']) {
      this.form.controls['mobile_no'].setErrors({
        'mobileNotUnique': true
      });
      html += '<p style="color: red;">' + res.errors['mobile_no'] + '</p>';
    }
    html += '</div>';
    this.popToast(html, '51');
  }
  resetForm() {
    this.formEditMode = false;
    this.show = false;
    this.form.reset();
    this.getNextRecordIdOfTable();
  }
  reset() {
    this.form.reset();
  }
  getEditSupplier(id: string) {
    this.editId = id;
    this.show = true;
    this.formEditMode = true;
    this.supplierService.getSupplierEdit(id).subscribe(supplier => {
      this.form.patchValue({
        type: supplier.type,
        title: supplier.title,
        company_name: supplier.company_name,
        contact: supplier.contact,
        address: supplier.address,
        office_no: supplier.office_no,
        mobile_no: supplier.mobile_no,
        fax: supplier.fax,
        email: supplier.email,
        city: supplier.city,
        ecc_no: supplier.ecc_no,
        cst_no: supplier.cst_no,
        range_no: supplier.range_no,
        division: supplier.division,
        comm: supplier.comm,
        pan_no: supplier.pan_no,
        tin_no: supplier.tin_no,
        account_grp: supplier.account_grp
      });
    }, err => {
      console.log('error');
    });
  }
  deleteSupplier(id: string) {
    this.supplierService.deleteSupplier(id).subscribe(res => {
      this.popToast('delete successfully !!', '');
      this.getAllSuppliers(this.itemsPerPage, this.pageIndex, '');
    }, err => {
      this.popToast('unable delete', '50');
      this.getAllSuppliers(this.itemsPerPage, this.pageIndex, '');
    });
  }
  generatePDF() {
    this.supplierService.getAllSupplierPDF().subscribe(
      res => {
        this.suppliersPDF = res;
        this.exportToPDF();
      }
    );
  }
  exportToPDF() {
    const columns = [
      { title: 'Id', dataKey: 0 },
      { title: 'Company Name', dataKey: 1 },
      { title: 'Supplier Type ', dataKey: 2 },
      { title: 'Phone', dataKey: 3 },
      { title: 'city', dataKey: 4 }
    ];
    const rows = [];
    this.suppliersPDF.forEach(supplier => {
      rows.push({
        0: supplier.id, 1: supplier.company_name,
        2: supplier.type == null ? '' : supplier.type,
        3: supplier.office_no == null ? '' : supplier.office_no,
        4: supplier.city == null ? '' : supplier.city
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
        doc.text('Supplier Details', doc.internal.pageSize.width / 2, 35, 'center');
      }
    });
    doc.save('Supplier.pdf');
  }

}
