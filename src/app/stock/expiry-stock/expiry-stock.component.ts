import { Component, OnInit } from '@angular/core';
import { IMyDpOptions } from 'mydatepicker';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ToasterService, BodyOutputType, Toast, ToasterConfig } from 'angular2-toaster';
import { ActivatedRoute } from '@angular/router';
import { ExpiryStockService } from './expiry-stock.service';
import { slideIn } from '../../shared/animation';
import { Observable } from 'rxjs/Rx';
import { ItemService } from '../../item/item.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { ExpiryStock } from './expiry-stock';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { CustomValidators } from '../../shared/customevalidators';
import { CommonService } from '../../shared/common.service';
import { UserService } from '../../user/user.service';


@Component({
  selector: 'app-expiry-stock',
  templateUrl: './expiry-stock.component.html',
  styleUrls: ['./expiry-stock.component.css'],
  animations: [slideIn]
})
export class ExpiryStockComponent implements OnInit {
  show = false;
  model = '';
  expiryStock: any[];
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
  expiryForm: FormGroup;
  formEditMode = false;
  listEditMode = false;
  serviceList = [];
  itemIngredients: any;
  mrn_noItemList: any[];
  nextRecordId: Number;
  users: any[];

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
      title: 'Damage/Expiry',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };

    this.toasterService.pop(toast);
  }
  constructor(private fb: FormBuilder, private toasterService: ToasterService,
    private routeService: ActivatedRoute, private expiryStockService: ExpiryStockService,
    private _itemService: ItemService, private _sanitizer: DomSanitizer, private _modal: Modal,
    private _commonService: CommonService, private _userService: UserService) {
    this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        // console.log('Event Fire At : ', data);
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
       this.getAllExpiryStock(this.itemsPerPage, this.pageIndex, '');
      });
    this.sortDir = 'asc';
    this.sortCol = 'id';
    this.ddlitemsPerPage = this.itemsPerPage;
    this.expiryForm = fb.group({
      'id': [],
      'slip_date': ['', [Validators.required]],
      'type': ['0', [Validators.required]],
      'enterd_by': ['', [Validators.required]],
      'approx_value_of': ['0', [Validators.required]],
      'approx_value_of_cp': ['0', [Validators.required]],
      'item': [''],
      'item_id': [''],
      'totalStock': ['', [Validators.required]],
      'quantity': ['', [Validators.required, CustomValidators.OnlyNumericValidate]],
      'rate': ['', [Validators.required]],
      'amt': [''],
      'remark': ['', [Validators.required]],
      'mrn_no': [''],
      'updateremark': [''],
      'itemList': this.fb.array([])
    });
  }

  ngOnInit() {
    this.getAllExpiryStock(this.itemsPerPage, this.pageIndex, '');
    this.getNextRecordIdOfTable();
    this.getAllUsers();
  }
  getAllUsers() {
    this._userService.getUsers().subscribe(
      res => {
        this.users = res;
      },
      err => {
        console.log('error');
      }
    );
  }
  setItemsPerPage() {
    this.itemsPerPage = this.ddlitemsPerPage;
    this.getAllExpiryStock(this.itemsPerPage, this.pageIndex, '');
  }
  onEnter(value: string) {
    this.getAllExpiryStock(this.itemsPerPage, this.pageIndex, value);
  }
  getPage(page: number) {
    this.pageIndex = page;
    this.getAllExpiryStock(this.itemsPerPage, this.pageIndex, '');
  }
  getAllExpiryStock(itemsPerPage: number, pageIndex: number, searchkey: any) {

    this.expiryStockService.getAllExpiryStock(itemsPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
      res => {
        this.expiryStock = res['data'];
        this.totalItems = res['total'];
        this.last_page = res['last_page'];
      },
      err => {
        console.log('error');
      }
    );
  }
  getNextRecordIdOfTable() {
    this._commonService.getLastNextRecordId('damage_stocks').subscribe(
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
    console.log(keyword);
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
    console.log(keyword);
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
    // this.searchItemBarcode = item.barcode;
      this.expiryForm.patchValue({
        'totalStock': item.stock,
        'item': item,
        'rate': item.salePrice,
      });
      if (this.formEditMode) {
        this.expiryForm.patchValue({
          'itemId': item.id
        });
      }

    }
  }
  typeChange() {
    // this.reset();
    this.resetIngredients();
  }
  getItemList(): FormArray {
    return <FormArray>this.expiryForm.controls['itemList'];
  }
  addFormArrayList() {
    // this.expiryForm.get('slip_date').clearValidators();
    // this.expiryForm.get('slip_date').updateValueAndValidity();
    this.expiryForm.get('type').markAsDirty();
    this.expiryForm.get('quantity').markAsDirty();
    this.expiryForm.get('remark').markAsDirty();
    this.expiryForm.get('totalStock').markAsDirty();
    this.expiryForm.get('rate').markAsDirty();
    if (this.expiryForm.get('type').valid && this.expiryForm.get('quantity').valid &&
  this.expiryForm.get('remark').valid && this.expiryForm.get('totalStock').valid && this.expiryForm.get('rate').valid) {
      const ingredient = this.expiryForm.value;
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
          //  this.emptyAll();
        } else {
          if (this.serviceList.length !== 0) {
            const duplicate = ingredient.itemList.filter(item => item.itemObj.barcode === ingredient.item.barcode);
            console.log(duplicate);
            if (duplicate.length !== 0) {
              const index = ingredient.itemList.findIndex(x => x.itemObj.barcode === duplicate[0].itemObj.barcode);
              // const index = ingredient.index;
              const qty = this.expiryForm.get('quantity').value;
              const remark = this.expiryForm.get('remark').value;
              this.itemIngredients = this.getItemList();
              this.expiryForm.get(['itemList', index, 'quantity']).setValue(qty);
              this.expiryForm.get(['itemList', index, 'remark']).setValue(remark);
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
    console.log(itemdata);
    return this.fb.group({
      id: new FormControl(''),
      damage_order_id: new FormControl(''),
      itemObj: new FormControl(itemdata.item),
      item_id: new FormControl(itemdata.item.id),
      quantity: new FormControl(itemdata.quantity),
      cp: new FormControl(itemdata.item.costPrice),
      rate: new FormControl(itemdata.item.salePrice),
      amt: new FormControl(Number(itemdata.quantity) * Number(itemdata.item.salePrice)),
      remark: new FormControl(itemdata.remark),
      mrn_no:  new FormControl(itemdata.mrn_no),
      deleted: new FormControl(false)
    });
  }
  emptyAll() {
    this.expiryForm.get('rate').reset();
    this.expiryForm.get('totalStock').reset();
    this.expiryForm.get('remark').reset();
    this.expiryForm.get('quantity').reset();
     this.expiryForm.get('mrn_no').reset();
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
      this.getAllItemByMrn_no(item.mrn_no);
      this.expiryForm.patchValue({
        'item': item.itemObj,
        'rate': item.rate,
        'quantity': item.quantity,
        'totalStock': item.itemObj.stock,
        'remark': item.remark,
        'item_id': item.id,
        'mrn_no': item.mrn_no
      });
      if (this.formEditMode) {
        this.expiryForm.patchValue({
          'item_id': item.id
        });
      }

    }
  }
  removeValidation() {
    this.expiryForm.get('quantity').clearValidators();
    this.expiryForm.get('remark').clearValidators();
    this.expiryForm.get('totalStock').clearValidators();
    this.expiryForm.get('rate').clearValidators();
    this.expiryForm.get('quantity').updateValueAndValidity();
    this.expiryForm.get('remark').updateValueAndValidity();
    this.expiryForm.get('totalStock').updateValueAndValidity();
    this.expiryForm.get('rate').updateValueAndValidity();
  }
  setvalidators() {
   // this.expiryForm.get('updateremark').setValidators(Validators.required);
   this.expiryForm.get('quantity').setValidators( [CustomValidators.OnlyNumericValidate , Validators.required ]);
    this.expiryForm.get('remark').setValidators(Validators.required);
    this.expiryForm.get('totalStock').setValidators(Validators.required);
    this.expiryForm.get('rate').setValidators(Validators.required);
  }
  onSubmit() {
    this.removeValidation();
   // this.expiryForm.get('slip_date').updateValueAndValidity();
  //  console.log( this.expiryForm.get('slip_date').valid);
    this.expiryForm.get('slip_date').markAsDirty();
    this.expiryForm.get('enterd_by').markAsDirty();
    this.expiryForm.get('approx_value_of_cp').markAsDirty();
    this.expiryForm.get('approx_value_of').markAsDirty();
    this.expiryForm.get('updateremark').markAsDirty();
    const lengthOfPackageService = this.expiryForm.get('itemList').value;
    if (lengthOfPackageService.length !== 0) {
      if (this.expiryForm.valid) {
      const formData = this.expiryForm.value;
      if (this.expiryForm.get('slip_date').value !== '' && this.expiryForm.get('slip_date') !== null) {
     //   console.log(this.expiryForm.get('slip_date').value);
        const slipDate = this.expiryForm.get('slip_date').value.date;
        const pDate = moment(new Date(slipDate.year, slipDate.month - 1, slipDate.day)).format('YYYY-MM-DD');
        formData['slip_date'] = pDate;
      }
      if (!this.formEditMode) {
        this.expiryStockService.addExpiryStock(formData).subscribe(
          res => {
            // this.spinner = false;
            if (res['status'] === 'success') {
              this.popToast('Saved successfully', '');
              this.resetForm();
              this.getAllExpiryStock(this.itemsPerPage, this.pageIndex, '');
            } else {
              //  this.duplicateErrors(res);
            }
          },
          err => {
            // this.spinner = false;
            this.popToast('Unable to save', '50');
            // this.resetForm();
          }
        );
      } else {
        const expiryId = this.expiryForm.get('id').value;
        // this.spinner = true;
        this.expiryStockService.updateExpiryStock(formData, expiryId).subscribe(
          res => {
            // this.spinner = false;
            if (res['status'] === 'success') {
              this.formEditMode = false;
              this.popToast('Updated Successfully!!', '');
              this.resetForm();
              this.getAllExpiryStock(this.itemsPerPage, this.pageIndex, '');
              this.expiryForm.get('updateremark').clearValidators();
              this.expiryForm.get('updateremark').updateValueAndValidity();
            } else {
              // this.duplicateErrors(res);
            }
          },
          err => {
            //  this.spinner = false;
            this.popToast('Unable to update!!', '50');
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
    this.expiryForm.reset();
    this.show = false;
    this.setvalidators();
    // this.searchbox = ' ';
    this.itemSearchName = '';
    this.itemSearchBarcode = '';
    this.formEditMode = false;
    this.listEditMode = false;
    // this.getNextRecordIdOfTable();
    //  this.removeAllItemServices();
    this.resetIngredients();
    this.getNextRecordIdOfTable();
    this.serviceList = [];
    this.expiryForm.get('type').setValue('0');
  }
  reset() {
    this.itemSearchName = '';
    this.itemSearchBarcode = '';
    this.listEditMode = false;
    this.expiryForm.reset();
    this.setvalidators();
    // this.removeAllItemServices();
    this.resetIngredients();
    this.serviceList = [];
    this.expiryForm.get('type').setValue('0');
  }
  // removeAllItemServices() {
  //   const itemIngredients = this.getItemList();
  //   for (let i = itemIngredients.controls.length - 1; i >= 0; i--) {
  //     itemIngredients.removeAt(i);
  //   }
  // }
  resetIngredients() {
    const items = this.expiryForm.get('itemList') as FormArray;
    for (let i = items.controls.length - 1; i >= 0; i--) {
      items.removeAt(i);
    }
  }
  totalApproxAmount() {
    let totalCost_cp = 0;
    let totalCost_sp = 0;
    this.expiryForm.get('approx_value_of_cp').setValue(0);
    this.expiryForm.get('approx_value_of').setValue(0);
    for (let j = 0; j <= this.getItemList().length - 1; j++) {
      if (this.getItemList().at(j).get('deleted').value === false) {
        const amount_cp = this.getItemList().at(j).get('cp').value;
        const qty = this.getItemList().at(j).get('quantity').value;
        totalCost_cp = +totalCost_cp + (+qty * +amount_cp);
        const amount_sp = this.getItemList().at(j).get('amt').value;
        totalCost_sp = +totalCost_sp + +amount_sp;
        //  console.log(totalCost);
      }
    }
    this.expiryForm.get('approx_value_of_cp').setValue(totalCost_cp);
    this.expiryForm.get('approx_value_of').setValue(totalCost_sp);
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
    this.expiryStockService.getExpiryStockById(id).subscribe(
      item => {
        this.formEditMode = true;
          console.log(item);
        // this.nextRecordId = item.id;
        this.setFormData(item);
        this.nextRecordId = item.id;
        if (item.type === 0) {
        this.itemIngredients = this.getItemList();
        if (item['damage_item_list'] !== null) {
          item['damage_item_list'].forEach(ing => {
            this.itemIngredients.push(
              this.fb.group({
                id: new FormControl(ing.id),
                damage_order_id: new FormControl(ing.damage_order_id),
                itemObj: new FormControl(ing.items),
                item_id: new FormControl(ing.item_id),
                quantity: new FormControl(ing.quantity),
                cp: new FormControl(ing.items.costPrice),
                rate: new FormControl(ing.rate),
                amt: new FormControl(ing.amt),
                remark: new FormControl(ing.remark),
                deleted: new FormControl(false),
              })
            );
            this.serviceList.push(item['damage_item_list']);
          });
          //  console.log(this.serviceList);
        }
      } else {
        this.itemIngredients = this.getItemList();
        if (item['expiry_item_list'] !== null) {
          item['expiry_item_list'].forEach(ing => {
            this.itemIngredients.push(
              this.fb.group({
                id: new FormControl(ing.id),
                expiry_order_id: new FormControl(ing.expiry_order_id),
                itemObj: new FormControl(ing.items),
                item_id: new FormControl(ing.item_id),
                quantity: new FormControl(ing.quantity),
                cp: new FormControl(ing.items.costPrice),
                rate: new FormControl(ing.rate),
                amt: new FormControl(ing.amt),
                remark: new FormControl(ing.remark),
                mrn_no: new FormControl(ing.mrn_no),
                deleted: new FormControl(false),
              })
            );
            this.serviceList.push(item['expiry_item_list']);
          });
          //  console.log(this.serviceList);
        }
      }
        // console.log(this.itemForm.get('item_ingredients').value);
      },
      err => { }
    );
  }
  setFormData(expiry: ExpiryStock) {
    this.expiryForm.get('id').setValue(expiry.id);
    this.dateFormate(expiry.slip_date);
    // this.expiryForm.get('slip_date').setValue(expiry.slip_date);
    this.expiryForm.get('type').setValue(expiry.type);
    this.expiryForm.get('approx_value_of_cp').setValue(expiry.approx_value_of_cp);
    this.expiryForm.get('approx_value_of').setValue(expiry.approx_value_of);
    this.expiryForm.get('enterd_by').setValue(expiry.enterd_by);
   // this.expiryForm.get('updateremark').setValidators(Validators.required);
  }
  dateFormate(spdate: string) {
    const slipDate = new Date(spdate);
    this.expiryForm.patchValue({
      slip_date: {
        date: {
          year: slipDate.getFullYear(),
          month: slipDate.getMonth() + 1,
          day: slipDate.getDate()
        }
      }
    });
  }
  getAllItemByMrn_no(mrn) {
    this.expiryStockService.getExpiryStockByMRN_no(mrn).subscribe(
      res => {
      //  console.log(res);
        this.expiryForm.get('mrn_no').setValue(res.getpurchase.id);
      //  console.log(res.getpurchase.id);
        this.mrn_noItemList = res['items'];
      //  console.log(this.mrn_noItemList);
      },
      err => {
        console.log('error');
      }
    );
  }
  onClick() {
    console.log('in');
    this._modal.confirm()
      .size('lg')
      .showClose(true)
      .title('A simple Confirm')
      .body(`
            <h4>Alert is a classic (title/body/footer) 1 button modal window that
            does not block.</h4>
            <b>Configuration:</b>
            <ul>
                <li>Non blocking (click anywhere outside to dismiss)</li>
                <li>Size large</li>
                <li>Dismissed with default keyboard key (ESC)</li>
                <li>Close wth button click</li>
                <li>HTML content</li>
            </ul>`)
      .open();
  }
  selecteditem(id) {
    if (id !== '0') {
      const itemid = parseInt(id);
      const Data = this.mrn_noItemList.filter(item => item.id === itemid)[0];
      this.expiryForm.get('item_id').setValue(Data.id);
      console.log(Data);
      this.searchItemSelected(Data);
    }
  }
  deleteExpiryStock(id: string) {
    this.expiryStockService.deleteExpiryStock(id).subscribe(res => {
      if (res['status'] === 'warning') {
        this.popToast(res['message'], '51');
      } else if (res['status'] === 'success') {
        this.popToast('deleted successfully !!', '');
        this.getAllExpiryStock(this.itemsPerPage, this.pageIndex, '');
      }
      // this.popToast('Package deleted successfully !!', '');
      // this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
    }, err => {
      this.popToast('Unable to delete ', '50');
      this.getAllExpiryStock(this.itemsPerPage, this.pageIndex, '');
    });
  }
  quantityChange() {
    const stock = this.expiryForm.get('totalStock').value;
    console.log(stock);
    if (stock !== '') {
        const qty = this.expiryForm.get('quantity').value;
        if ( stock < qty ) {
          this.expiryForm.controls['quantity'].setErrors({
            'qtyGreaterThanStock': true
          });
        }
    }
  }
  StockChange() {
    const  qty = this.expiryForm.get('quantity').value;
    console.log(qty);
    if (qty !== '') {
        const stock = this.expiryForm.get('totalStock').value;
        if ( stock < qty ) {
          this.expiryForm.controls['quantity'].setErrors({
            'qtyGreaterThanStock': true
          });
        }
    }
  }
}
