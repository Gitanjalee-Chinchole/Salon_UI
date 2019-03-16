import { Component, OnInit } from '@angular/core';
import { IMyDpOptions } from 'mydatepicker';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ToasterService, BodyOutputType, Toast, ToasterConfig } from 'angular2-toaster';
import { ActivatedRoute } from '@angular/router';
import { slideIn } from '../../shared/animation';
import { Observable } from 'rxjs/Rx';
import { ItemService } from '../../item/item.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { CustomValidators } from '../../shared/customevalidators';
import { CommonService } from '../../shared/common.service';
import { IssueItemStockService } from './issue-item-stock.service';
import { EmployeeService } from '../../employee/employee.service';

@Component({
  selector: 'app-issue-item-stock',
  templateUrl: './issue-item-stock.component.html',
  styleUrls: ['./issue-item-stock.component.css'],
  animations: [slideIn]
})
export class IssueItemStockComponent implements OnInit {
  show = false;
  model = '';
  issueStock: any[];
  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    height: '28px'
  };
  searchKey: any;
  sortCol: string;
  sortDir: string;
  queryParams: any;
  pageIndex = 1;
  ddlitemsPerPage: any;
  itemsPerPage = 10;
  totalItems = 0;
  last_page: number;
  itemSearchName: any;
  itemSearchBarcode = '';
  issueForm: FormGroup;
  formEditMode = false;
  listEditMode = false;
  serviceList = [];
  itemIngredients: any;
  nextRecordId: Number;
  employees: any[];
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
      title: 'Issue Stock',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };

    this.toasterService.pop(toast);
  }
  constructor(private fb: FormBuilder, private toasterService: ToasterService,
    private routeService: ActivatedRoute, private issueItemStockService: IssueItemStockService,
    private _itemService: ItemService, private _sanitizer: DomSanitizer, private _modal: Modal,
     private _commonService: CommonService, private _employeeService: EmployeeService) {
      this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        // console.log('Event Fire At : ', data);
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getAllIssueStock(this.itemsPerPage, this.pageIndex, '');
      });
    this.sortDir = 'asc';
    this.sortCol = 'id';
    this.ddlitemsPerPage = this.itemsPerPage;
    this.issueForm = fb.group({
      'id': [],
      'slip_date': ['', [Validators.required]],
      'issue_to': ['', [Validators.required]],
      'approx_value_of': ['0', [Validators.required]],
      'item': [''],
      'item_id': [''],
      'totalStock': ['', [Validators.required]],
      'quantity': ['', [Validators.required, CustomValidators.OnlyNumericValidate]],
      'rate': ['', [Validators.required]],
      'amt': [''],
      'remark': ['', [Validators.required]],
     // 'updateremark': [''],
      'itemList': this.fb.array([])
    });
     }

  ngOnInit() {
    this.getAllIssueStock(this.itemsPerPage, this.pageIndex, '');
    this. getAllEmployees();
    this.getNextRecordIdOfTable();
  }
  getAllEmployees() {
    this._employeeService.getAllEmployees().subscribe(
      res => {
        this.employees = res;
      },
      err => {
        console.log('error');
      }
    );
  }
  setItemsPerPage() {
    this.itemsPerPage = this.ddlitemsPerPage;
    this.getAllIssueStock(this.itemsPerPage, this.pageIndex, '');
  }
  onEnter(value: string) {
    this.getAllIssueStock(this.itemsPerPage, this.pageIndex, value);
  }
  getPage(page: number) {
    this.pageIndex = page;
    this.getAllIssueStock(this.itemsPerPage, this.pageIndex, '');
  }
  getAllIssueStock(itemsPerPage: number, pageIndex: number, searchkey: any) {

    this.issueItemStockService.getAllIssueStock(itemsPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
      res => {
        this.issueStock = res['data'];
        this.totalItems = res['total'];
        this.last_page = res['last_page'];
      },
      err => {
        console.log('error');
      }
    );
  }
  getNextRecordIdOfTable() {
    this._commonService.getLastNextRecordId('issue_stocks').subscribe(
      res => {
        this.nextRecordId = res;
      },
      err => {
        console.log(err);
      }
    );
  }
  itemBarcodeFormatter = (data: any) => {
    const html = `
         <span style='width:13%; display: inline-block'>${data.barcode}</span>
         `;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }
  searchItemBarcode = (keyword: any): Observable<any[]> => {
  //  console.log(keyword);
    if (keyword.length >= 2) {
      return this._itemService.itemSearchByName(keyword, 'Product', 'barcode').map(
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
  itemNameFormatter = (data: any) => {
    const html = `
         <span style='width:13%; display: inline-block'>${data.itemName}</span>
         `;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }
  searchItemName = (keyword: any): Observable<any[]> => {
   // console.log(keyword);
    if (keyword.length >= 2) {
      return this._itemService.itemSearchByName(keyword, 'Product', 'itemName').map(
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
  searchItemSelected(item) {
    // console.log(item);
    if (typeof (item) !== 'string') {
      //  console.log(item);
      //  this.searchItemSelected = item;
     // this.searchItemName = item.itemName;
    // this.searchItemBarcode = item;
      this.issueForm.patchValue({
        'totalStock': item.stock,
        'item': item,
        'rate': item.salePrice,
      });
      if (this.formEditMode) {
        this.issueForm.patchValue({
          'itemId': item.id
        });
      }

    }
  }
  getItemList(): FormArray {
    return <FormArray>this.issueForm.controls['itemList'];
  }
  addFormArrayList() {
    // this.issueForm.get('slip_date').clearValidators();
    // this.issueForm.get('slip_date').updateValueAndValidity();
    this.issueForm.get('quantity').markAsDirty();
    this.issueForm.get('remark').markAsDirty();
    this.issueForm.get('totalStock').markAsDirty();
    this.issueForm.get('rate').markAsDirty();
    if (this.issueForm.get('quantity').valid &&
  this.issueForm.get('remark').valid && this.issueForm.get('totalStock').valid && this.issueForm.get('rate').valid) {
      const ingredient = this.issueForm.value;
      if (typeof (ingredient) !== 'string') {
        if (!this.listEditMode) {
          if (this.serviceList.length !== 0) {
            const duplicate = ingredient.itemList.filter(item => item.itemObj.barcode === ingredient.item.barcode);

            if (duplicate.length !== 0) {
              //  const index = ingredient.itemList.findIndex(x => x.barcode === duplicate[0].barcode);
              this.popToast('Item already exist in order !', '51');
            } else {
              this.serviceList.push(ingredient);
              this.itemIngredients = this.getItemList();
              this.itemIngredients.push(this.addToItemPackageList(ingredient));
            }
          } else {
            this.serviceList.push(ingredient);
            this.itemIngredients = this.getItemList();
            this.itemIngredients.push(this.addToItemPackageList(ingredient));
          }
        } else {
          if (this.serviceList.length !== 0) {
            const duplicate = ingredient.itemList.filter(item => item.itemObj.barcode === ingredient.item.barcode);
          //  console.log(duplicate);
            if (duplicate.length !== 0) {
              const index = ingredient.itemList.findIndex(x => x.itemObj.barcode === duplicate[0].itemObj.barcode);
              // const index = ingredient.index;
              const qty = this.issueForm.get('quantity').value;
              const remark = this.issueForm.get('remark').value;
              this.itemIngredients = this.getItemList();
              this.issueForm.get(['itemList', index, 'quantity']).setValue(qty);
              this.issueForm.get(['itemList', index, 'remark']).setValue(remark);
            } else {

              this.serviceList.push(ingredient);
              this.itemIngredients = this.getItemList();
              this.itemIngredients.push(this.addToItemPackageList(ingredient));
            }
          } else {
            this.serviceList.push(ingredient);
            this.itemIngredients = this.getItemList();
            this.itemIngredients.push(this.addToItemPackageList(ingredient));
          }
        }
        this.totalApproxAmount();
          this.itemSearchName = '';
          this.itemSearchBarcode = '';
        this.listEditMode = false;
        this.emptyAll();
      }
    }
  }
  addToItemPackageList(itemdata: any): FormGroup {
   // console.log(itemdata);
    return this.fb.group({
      id: new FormControl(''),
      issue_stocks_id: new FormControl(''),
      itemObj: new FormControl(itemdata.item),
      item_id: new FormControl(itemdata.item.id),
      quantity: new FormControl(itemdata.quantity),
      rate: new FormControl(itemdata.item.salePrice),
      amt: new FormControl(Number(itemdata.quantity) * Number(itemdata.item.salePrice)),
      remark: new FormControl(itemdata.remark),
      deleted: new FormControl(false)
    });
  }
  emptyAll() {
    this.issueForm.get('rate').reset();
    this.issueForm.get('totalStock').reset();
    this.issueForm.get('remark').reset();
    this.issueForm.get('quantity').reset();
  }
  editService(j: number) {
    this.listEditMode = true;
    const item = this.getItemList().at(j).value;
    if (typeof (item) !== 'string') {
     // console.log(item);
      //  this.searchItemSelected = item;
      // this.itemBarcodeFormatter(item.itemObj);
      this.itemSearchBarcode = item.itemObj.barcode;
      this.itemSearchName = item.itemObj.itemName;
      this.issueForm.patchValue({
        'item': item.itemObj,
        'rate': item.rate,
        'quantity': item.quantity,
        'totalStock': item.itemObj.stock,
        'remark': item.remark,
        'item_id': item.id,
      });
      if (this.formEditMode) {
        this.issueForm.patchValue({
          'item_id': item.id
        });
      }

    }
  }
  removeValidation() {
    this.issueForm.get('quantity').clearValidators();
    this.issueForm.get('remark').clearValidators();
    this.issueForm.get('totalStock').clearValidators();
    this.issueForm.get('rate').clearValidators();
    this.issueForm.get('quantity').updateValueAndValidity();
    this.issueForm.get('remark').updateValueAndValidity();
    this.issueForm.get('totalStock').updateValueAndValidity();
    this.issueForm.get('rate').updateValueAndValidity();
  }
  setvalidators() {
   // this.issueForm.get('updateremark').setValidators(Validators.required);
   this.issueForm.get('quantity').setValidators( [CustomValidators.OnlyNumericValidate , Validators.required ]);
    this.issueForm.get('remark').setValidators(Validators.required);
    this.issueForm.get('totalStock').setValidators(Validators.required);
    this.issueForm.get('rate').setValidators(Validators.required);
  }
  onSubmit() {
    this.removeValidation();
   // this.issueForm.get('slip_date').updateValueAndValidity();
   // console.log( this.issueForm.get('slip_date').valid);
    this.issueForm.get('slip_date').markAsDirty();
    this.issueForm.get('issue_to').markAsDirty();
    this.issueForm.get('approx_value_of').markAsDirty();
   // this.issueForm.get('updateremark').markAsDirty();
    const lengthOfPackageService = this.issueForm.get('itemList').value;
    if (lengthOfPackageService.length !== 0) {
      if (this.issueForm.valid) {
      const formData = this.issueForm.value;
      if (this.issueForm.get('slip_date').value !== '' && this.issueForm.get('slip_date') !== null) {
     //   console.log(this.issueForm.get('slip_date').value);
        const slipDate = this.issueForm.get('slip_date').value.date;
        const pDate = moment(new Date(slipDate.year, slipDate.month - 1, slipDate.day)).format('YYYY-MM-DD');
        formData['slip_date'] = pDate;
      }
      if (!this.formEditMode) {
        this.issueItemStockService.addIssueStock(formData).subscribe(
          res => {
            // this.spinner = false;
            if (res['status'] === 'success') {
              this.popToast('Issue item Saved successfully', '');
              this.resetForm();
              this.getAllIssueStock(this.itemsPerPage, this.pageIndex, '');
            } else {
              //  this.duplicateErrors(res);
            }
          },
          err => {
            // this.spinner = false;
            this.popToast('Unable to save issue item', '50');
            // this.resetForm();
          }
        );
      } else {
        const expiryId = this.issueForm.get('id').value;
        // this.spinner = true;
        this.issueItemStockService.updateIssueStock(formData, expiryId).subscribe(
          res => {
            // this.spinner = false;
            if (res['status'] === 'success') {
              this.formEditMode = false;
              this.popToast('Issue item Updated Successfully!!', '');
              this.resetForm();
              this.getAllIssueStock(this.itemsPerPage, this.pageIndex, '');
              // this.issueForm.get('updateremark').clearValidators();
              // this.issueForm.get('updateremark').updateValueAndValidity();
            } else {
              // this.duplicateErrors(res);
            }
          },
          err => {
            //  this.spinner = false;
            this.popToast('Unable to update issue item!!', '50');
            // this.resetForm();
          }
        );
      }
    }
    } else {
      this.popToast('list should have one Item/Service', '51');
    }

  }
  resetForm() {
    this.issueForm.reset();
    this.show = false;
    this.setvalidators();
    // this.searchbox = ' ';
    this.itemSearchName = '';
    this.itemSearchBarcode = '';
    this.formEditMode = false;
    this.listEditMode = false;
    //  this.removeAllItemServices();
    this.resetIngredients();
    this.getNextRecordIdOfTable();
    this.serviceList = [];
  }
  reset() {
    this.itemSearchName = '';
    this.itemSearchBarcode = '';
    this.listEditMode = false;
    this.issueForm.reset();
    this.setvalidators();
    // this.removeAllItemServices();
    this.resetIngredients();
    this.serviceList = [];
  }
  // removeAllItemServices() {
  //   const itemIngredients = this.getItemList();
  //   for (let i = itemIngredients.controls.length - 1; i >= 0; i--) {
  //     itemIngredients.removeAt(i);
  //   }
  // }
  resetIngredients() {
    const items = this.issueForm.get('itemList') as FormArray;
    for (let i = items.controls.length - 1; i >= 0; i--) {
      items.removeAt(i);
    }
  }
  totalApproxAmount() {
    let totalCost_sp = 0;
    this.issueForm.get('approx_value_of').setValue(0);
    for (let j = 0; j <= this.getItemList().length - 1; j++) {
      if (this.getItemList().at(j).get('deleted').value === false) {
        const amount_sp = this.getItemList().at(j).get('amt').value;
        totalCost_sp = +totalCost_sp + +amount_sp;
        //  console.log(totalCost);
      }
    }
    this.issueForm.get('approx_value_of').setValue(totalCost_sp);
  }
  removeService(i: number) {
    this.serviceList.splice(i, 1);
    // if (this.getItemList().at(i).get('id').value !== '') {
    //   this.getItemList().at(i).get('deleted').setValue(true);
    // } else {
    this.getItemList().removeAt(i);
    // }
    this.totalApproxAmount();
  }
  getExpiryToEdit(id: number) {
    this.show = true;
    this.resetIngredients();
    this.issueItemStockService.getIssueStockById(id).subscribe(
      item => {
        this.formEditMode = true;
         // console.log(item);
         this.nextRecordId = item.id;
        this.setFormData(item);
        this.nextRecordId = item.id;
        this.itemIngredients = this.getItemList();
        if (item['issue_item_list'] !== null) {
          item['issue_item_list'].forEach(ing => {
            this.itemIngredients.push(
              this.fb.group({
                id: new FormControl(ing.id),
                issue_order_id: new FormControl(ing.issue_order_id),
                itemObj: new FormControl(ing.items),
                item_id: new FormControl(ing.item_id),
                quantity: new FormControl(ing.quantity),
                rate: new FormControl(ing.rate),
                amt: new FormControl(ing.amt),
                remark: new FormControl(ing.remark),
                deleted: new FormControl(false),
              })
            );
            this.serviceList.push(item['issue_item_list']);
          });
          //  console.log(this.serviceList);
        }
        // console.log(this.itemForm.get('item_ingredients').value);
      },
      err => { }
    );
  }
  setFormData(expiry: any) {
    this.issueForm.get('id').setValue(expiry.id);
    this.dateFormate(expiry.slip_date);
    // this.issueForm.get('slip_date').setValue(expiry.slip_date);
    this.issueForm.get('approx_value_of').setValue(expiry.approx_value_of);
    this.issueForm.get('issue_to').setValue(expiry.issue_to);
   // this.issueForm.get('updateremark').setValidators(Validators.required);
  }
  dateFormate(spdate: string) {
    const slipDate = new Date(spdate);
    this.issueForm.patchValue({
      slip_date: {
        date: {
          year: slipDate.getFullYear(),
          month: slipDate.getMonth() + 1,
          day: slipDate.getDate()
        }
      }
    });
  }
  deleteissueStock(id: string) {
    this.issueItemStockService.deleteIssueStock(id).subscribe(res => {
      if (res['status'] === 'warning') {
        this.popToast(res['message'], '51');
      } else if (res['status'] === 'success') {
        this.popToast('issue stock deleted successfully !!', '');
        this.getAllIssueStock(this.itemsPerPage, this.pageIndex, '');
      }
      // this.popToast('Package deleted successfully !!', '');
      // this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
    }, err => {
      this.popToast('Unable to delete issue stock', '50');
      this.getAllIssueStock(this.itemsPerPage, this.pageIndex, '');
    });
  }
  // quantityChange() {
  //   const stock = this.issueForm.get('totalStock').value;
  //   console.log(stock);
  //   if (stock !== '') {
  //       const qty = this.issueForm.get('quantity').value;
  //       if ( stock < qty ) {
  //         this.issueForm.controls['quantity'].setErrors({
  //           'qtyGreaterThanStock': true
  //         });
  //       }
  //   }
  // }
  // StockChange() {
  //   const  qty = this.issueForm.get('quantity').value;
  //   console.log(qty);
  //   if (qty !== '') {
  //       const stock = this.issueForm.get('totalStock').value;
  //       if ( stock < qty ) {
  //         this.issueForm.controls['quantity'].setErrors({
  //           'qtyGreaterThanStock': true
  //         });
  //       }
  //   }
  // }
}
