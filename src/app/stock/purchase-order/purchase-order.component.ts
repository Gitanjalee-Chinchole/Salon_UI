import { Component, OnInit } from '@angular/core';
import { IMyDpOptions } from 'mydatepicker';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { ActivatedRoute } from '@angular/router';
import { ItemService } from '../../item/item.service';
import { SupplierService } from '../../supplier/supplier.service';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrder } from './purchase-order';
import { window } from 'rxjs/operator/window';
import { slideIn } from '../../shared/animation';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Category } from '../../category/category';
import { CategoryService } from '../../category/category.service';
import { CustomValidators } from '../../shared/customevalidators';
import { CommonService } from '../../shared/common.service';
import { Supplier } from '../../supplier/supplier';
import * as moment from 'moment';
@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.css'],
  providers: [
    { provide: 'Window', useValue: window }
  ],
  animations: [slideIn]
})
export class PurchaseOrderComponent implements OnInit {
  model: any;
  show = false;
  formEditMode = false;
  itemEditMode = false;
  form: FormGroup;
  purchaseOrders: PurchaseOrder[];
  ordersPerPage = 10;
  pageIndex = 1;
  totalOrders = 0;
  last_page: number;
  ddlordersPerPage: any;
  searchkey: any;
  sortCol: string;
  sortDir: string;
  queryParams: any;
  editId: string;
  searchbox = '';
  parentCategory: Category[];
  childCategory: Category[];
  orderList = [];
  itemIngredients: any;
  itemSearch: any;
  nextRecordId = 0;
  suppliers: Supplier[];
  valid = false;
  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    height: '28px'
  };

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
      title: 'Purchase Order',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };
    this.toasterService.pop(toast);
  }
  constructor(private fb: FormBuilder, private toasterService: ToasterService, private routeService: ActivatedRoute,
    private itemService: ItemService, private supplierService: SupplierService, private purchaseOrderService: PurchaseOrderService,
    private sanitizer: DomSanitizer, private catService: CategoryService, private commonService: CommonService) {
    this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, '');
      });
    this.sortCol = 'id';
    this.sortDir = 'asc';
    this.ddlordersPerPage = this.ordersPerPage;
    this.form = fb.group({
      id: [''],
      purchase_order_date: ['', [Validators.required]],
      supplierId: ['', [Validators.required]],
      parentCategory: ['0'],
      category: [''],
      item: [],
      quantity: ['', [Validators.required, CustomValidators.OnlyNumericValidate]],
      status: ['Pending'],
      itemName: [''],
      purchase_order_item: fb.array([])
    });
  }

  ngOnInit() {
    this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, '');
    this.getNextRecordIdOfTable();
    this.getSupplier();
    this.getParentCategory();
  }

  onEnter(value: string) {
    this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, value);
  }
  getPage(page: number) {
    this.pageIndex = page;
    this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, '');
  }

  setOrdersPerPage() {
    this.ordersPerPage = this.ddlordersPerPage;
    this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, '');
  }
  getPurchaseOrders(ordersPerPage: number, pageIndex: number, searchkey: any) {
    this.purchaseOrderService.getPurchaseOrdersPaginate(ordersPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
      data => {
        this.purchaseOrders = data['data'];
        this.totalOrders = data['total'];
        this.last_page = data['last_page'];
      },
      err => { }
    );
  }

  getNextRecordIdOfTable() {
    this.commonService.getLastNextRecordId('purchase_order').subscribe(
      res => {
        this.nextRecordId = res;
      },
      err => { }
    );
  }
  autoCompleteList = (data: any) => {
    const html = `<span style='width:13%; display: inline-block'>${data.itemName}</span>`;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  onParentCategoryChange(parent) {
    if (parent !== '0') {
      this.getChildCategory(parent);
    } else {
      this.childCategory.length = 0;
    }
  }
  getParentCategory() {
    this.catService.getAllCategories(0).subscribe(data => {
      this.parentCategory = data;
    },
      err => { }
    );
  }
  getChildCategory(parentId: number) {
    this.catService.getAllCategories(parentId).subscribe(data => {
      this.childCategory = data;
    },
      err => { }
    );
  }

  getSupplier() {
    this.supplierService.getAllSupplierPDF().subscribe(data => {
      this.suppliers = data;
    },
      err => { });
  }
  selectedItems(item) {
    if (typeof (item) !== 'string') {
      this.getChildCategory(item.category.parent_category);
      this.form.patchValue({
        parentCategory: item.category.parent_category,
        category: item.category.id,
        item: item,
      });
      // if (this.formEditMode) {
      //   this.form.patchValue({
      //     'itemId': item.id
      //   });
      // }
    }
    this.quantityChange();
  }
  quantityChange() {
    const quantity = this.form.get('quantity').value;
  }
  getOrderList(): FormArray {
    return <FormArray>this.form.controls['purchase_order_item'];
  }
  addArrayList() {
    this.markRequiredFieldsAsDirty();
    this.form.get('quantity').markAsDirty();
    if (this.form.valid) {
      const ingredient = this.form.get('item').value;
      if (typeof (ingredient) !== 'string' && ingredient !== null) {

        if (this.orderList.length !== 0) {
          const duplicate = this.orderList.filter(item => item.barcode === ingredient.barcode);

          if (duplicate.length !== 0) {
            const index = this.orderList.findIndex(x => x.barcode === duplicate[0].barcode);
            const quantity = this.form.get('quantity').value;
            this.itemIngredients = this.getOrderList();
            this.form.get(['purchase_order_item', index, 'quantity']).setValue(quantity);
          } else {
            ingredient['quantity'] = this.form.get('quantity').value;
            this.orderList.push(ingredient);
            this.itemIngredients = this.getOrderList();
            this.itemIngredients.push(this.itemArrayList(ingredient));
          }
        } else {
          ingredient['quantity'] = this.form.get('quantity').value;
          this.orderList.push(ingredient);
          this.itemIngredients = this.getOrderList();
          this.itemIngredients.push(this.itemArrayList(ingredient));
        }
        this.searchbox = '';
        this.itemEditMode = false;
        this.emptyAll();
      }
    }
  }

  emptyAll() {
    this.form.get('quantity').reset();
    this.form.get('category').reset();
    this.form.get('parentCategory').reset();
    this.itemSearch = '';
  }

  deleteItems(i: number) {
    this.orderList.splice(i, 1);
    if (this.getOrderList().at(i).get('id').value !== '') {
      this.getOrderList().at(i).get('deleted').setValue(true);
    } else {
      this.getOrderList().removeAt(i);
    }
  }

  editItems(j: number) {
    this.itemEditMode = true;
    const item = this.getOrderList().at(j).get('itemObj').value;
    if (typeof (item) !== 'string') {
      this.getChildCategory(item.category.parent_category);
      this.form.patchValue({
        parentCategory: item.category.parent_category,
        category: item.category.id,
        itemName: item.itemName,
        item: item,
        quantity: this.getOrderList().at(j).get('quantity').value,
      });
      if (this.formEditMode) {
        this.form.patchValue({
          itemId: item.id,
          // quantity: item.quantity
        });
        this.searchbox = item.itemName;
      }

    }
  }

  searchItem = (keyword: any): Observable<any[]> => {
    if (keyword.length >= 2) {
      return this.itemService.searchIngredients(keyword, 'Product', 'itemName').map(
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

  itemArrayList(item: any): FormGroup {
    return this.fb.group({
      id: new FormControl(''),
      itemObj: new FormControl(item),
      itemId: new FormControl(item.id),
      quantity: new FormControl(item.quantity),
      itemName: new FormControl(item.itemName),
      purchase_order_id: new FormControl(''),
      deleted: new FormControl(false)
    });
  }
  markRequiredFieldsAsDirty() {
    this.form.get('purchase_order_date').markAsDirty();
    this.form.get('supplierId').markAsDirty();
  }
  onSubmit() {
    this.markRequiredFieldsAsDirty();
    this.form.get('quantity').clearValidators();
    this.form.get('quantity').updateValueAndValidity();
    const pOItem = this.form.get('purchase_order_item').value;
    if (pOItem.length !== null && pOItem.length !== 0) {
      const formData = this.form.value;

      if (this.form.valid) {
        if (this.form.get('purchase_order_date').value !== '' && this.form.get('purchase_order_date') !== null) {
          const prchaseDate = this.form.get('purchase_order_date').value.date;
          const pDate = moment(new Date(prchaseDate.year, prchaseDate.month - 1, prchaseDate.day)).format('YYYY-MM-DD');
          formData['purchase_order_date'] = pDate;
        }
        if (!this.formEditMode === true) {
          this.form.get('status').setValue('Pending');
          this.purchaseOrderService.addPurchaseOrder(formData).subscribe(
            res => {
              if (res['status'] === 'success') {
                this.popToast('Order saved successfully', '');
                this.resetForm();
                this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, '');
                this.getNextRecordIdOfTable();
              }
            },
            err => {
              this.popToast('Unable to save order', '50');
            }
          );
        } else {
          // const st = this.form.get('status').value;
          const purchase_order_id = this.form.get('id').value;
          this.purchaseOrderService.updatePurchaseOrder(formData, purchase_order_id).subscribe(
            res => {
              if (res['status'] === 'success') {
                this.formEditMode = false;
                this.popToast('Order updated successfully!!', '');
                this.resetForm();
                this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, '');
                this.getNextRecordIdOfTable();
              }
            },
            err => {
              this.popToast('Unable to update order!!', '50');
              this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, '');
            }
          );
        }
      }
    } else {
      this.popToast('Purchase order contains atleast one item', '51');
    }
  }

  dateFormat(pDate: string) {
    const purchase_date = new Date(pDate);
    this.form.patchValue({
      purchase_order_date: pDate !== null && pDate !== '' ? {
        date: {
          year: purchase_date.getFullYear(),
          month: purchase_date.getMonth() + 1,
          day: purchase_date.getDate()
        }
      } : '',
    });
  }
  resetForm() {
    this.show = false;
    this.searchbox = '';
    this.formEditMode = false;
    this.form.reset();
    this.resetItems();
    // this.getNextRecordIdOfTable();
    this.orderList = [];
  }
  resetItems() {
    const itemIngredients = this.getOrderList();
    for (let i = itemIngredients.controls.length - 1; i >= 0; i--) {
      itemIngredients.removeAt(i);
    }
  }
  getEditOrder(id: number) {
    this.show = true;
    this.resetItems();
    this.purchaseOrderService.getOrderById(id).subscribe(
      item => {
        this.formEditMode = true;
        this.nextRecordId = item.id;
        this.setFormData(item);
        this.itemIngredients = this.getOrderList();
        if (item['purchase_order_items'] !== null) {
          item['purchase_order_items'].forEach(data => {
            this.itemIngredients.push(
              this.fb.group({
                id: new FormControl(data.id),
                purchase_order_id: new FormControl(data.purchase_order_id),
                itemObj: new FormControl(data.item),
                itemId: new FormControl(data.itemId),
                quantity: new FormControl(data.quantity),
                itemName: new FormControl(data.itemName),
                deleted: new FormControl(false),
              })
            );
            this.orderList.push(data.item);
          });
        }
      },
      err => { }
    );
    this.form.get('quantity').setValidators([Validators
      .required, CustomValidators.OnlyNumericValidate]);
    this.form.get('quantity').updateValueAndValidity();

  }
  setFormData(order: PurchaseOrder) {
    this.form.get('id').setValue(order.id);
    this.form.get('supplierId').setValue(order.supplierId);
    this.dateFormat(order.purchase_order_date);
  }
  deleteOrder(id: string) {
    this.purchaseOrderService.deletePurchaseOrder(id).subscribe(data => {
      this.popToast('Purchase order deleted successfully !!', '');
      this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, '');
    }, err => {
      this.popToast('Unable to delete purchase order', '50');
      this.getPurchaseOrders(this.ordersPerPage, this.pageIndex, '');
    });
  }

  reset() {
    this.form.reset();
    this.resetItems();
    this.orderList = [];
  }
}

