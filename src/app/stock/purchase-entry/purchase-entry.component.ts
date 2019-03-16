import { Component, OnInit, Renderer, ElementRef, ViewChild } from '@angular/core';
import { IMyDpOptions } from 'mydatepicker';
import { Popup } from 'ng2-opd-popup';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Purchase } from './purchase-entry';
import { Category } from '../../category/category';
import { Supplier } from '../../supplier/supplier';
import { ToasterService, Toast, BodyOutputType, ToasterConfig } from 'angular2-toaster';
import { ActivatedRoute } from '@angular/router';
import { ItemService } from '../../item/item.service';
import { SupplierService } from '../../supplier/supplier.service';
import { PurchaseOrderService } from '../purchase-order/purchase-order.service';
import { PurchaseEntryService } from './purchase-entry.service';
import { CategoryService } from '../../category/category.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../shared/common.service';
import { CustomValidators } from '../../shared/customevalidators';
import { Observable } from 'rxjs/Observable';
import { UnitService } from '../../unit/unit.service';
import { Unit } from '../../unit/unit';
import * as moment from 'moment';
import { slideIn } from '../../shared/animation';
import { PurchaseOrder } from '../purchase-order/purchase-order';
import { count } from 'rxjs/operator/count';
import { EmployeeService } from '../../employee/employee.service';
import { Employee } from '../../employee/employee';

@Component({
  selector: 'app-purchase-entry',
  templateUrl: './purchase-entry.component.html',
  styleUrls: ['./purchase-entry.component.css'],
  providers: [
    { provide: 'Window', useValue: window }
  ],
  animations: [slideIn]
})
export class PurchaseEntryComponent implements OnInit {
  model: any;
  model1: any;
  show = false;
  formEditMode = false;
  fileUpload = false;
  form: FormGroup;
  itemForm: FormGroup;
  purchases: Purchase[];
  purchaseOrders: PurchaseOrder[];
  purchasesPerPage = 10;
  pageIndex = 1;
  totalPurchases = 0;
  ddlpurchasesPerPage: any;
  last_page: number;
  searchkey: any;
  sortCol: string;
  sortDir: string;
  queryParams: any;
  searchbox: '';
  parentCategory: Category[];
  childCategory: Category[];
  suppliers: Supplier[];
  units: Unit[];
  employees: Employee[];
  itemIngredients: any;
  nextRecordId = 0;
  purchaseList = [];
  product_code: any;
  total_amount: any;
  totalDiscount = [];
  discAmount: any;
  poId: any;
  stock: any;
  total: any;
  array = [];
  fileData: any;
  fileItemData: any;
  currentDate = new Date();
  // private xlsxToJsonService: XlsxToJsonService = new XlsxToJsonService();

  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    height: '28px',
    disableUntil: {
      year: this.currentDate.getFullYear(),
      month: this.currentDate.getMonth() + 1,
      day: this.currentDate.getDate() - 1
    }
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
      title: 'Purchase',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };
    this.toasterService.pop(toast);
  }

  @ViewChild('importItemsfileInput') importItemsfileInput: ElementRef;
  constructor(private popup: Popup, private fb: FormBuilder, private toasterService: ToasterService, private routeService: ActivatedRoute,
    private itemService: ItemService, private supplierService: SupplierService, private purchaseOrderService: PurchaseOrderService,
    private purchaseService: PurchaseEntryService, private catService: CategoryService, private unitService: UnitService,
    private dSanitizer: DomSanitizer, private commonService: CommonService, private renderer: Renderer, private employeeService: EmployeeService) {
    this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params).distinctUntilChanged().subscribe(data => {
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getPurchases(this.purchasesPerPage, this.pageIndex, '');
      });
    this.sortCol = 'id';
    this.sortDir = 'asc';
    this.ddlpurchasesPerPage = this.purchasesPerPage;
    this.form = fb.group({
      id: [''],
      mrn_date: ['', [Validators.required]],
      supplierId: ['', [Validators.required]],
      poId: [''],
      supplier_bill_no: ['', [Validators.required]],
      supplier_bill_date: ['', [Validators.required]],
      purchase_mode: ['', [Validators.required]],
      received_by: ['', [Validators.required]],
      sub_total: ['0.00'],
      vat_amount: ['0.00'],
      discount_amount: ['0.00'],
      extra_discount: ['0', CustomValidators.decimalValidate],
      bill_amount: ['0.00'],
      purchaseItems: fb.array([])
    });

    this.itemForm = fb.group({
      itemId: [''],
      parentCategory: ['0'],
      category: [''],
      unitId: [''],
      product_code: [''],
      rate: [''],
      mrp: [''],
      item: [],
      total_amount: ['0.00'],
      total_discount: ['0.00'],
      cp_vat: ['0.00'],
      discount_rate: ['0.00', [CustomValidators.decimalValidate]],
      quantity: ['', [Validators.required, CustomValidators.OnlyNumericValidate, CustomValidators.zeroNotAllowed]],
      itemName: [''],
      stock: [''],
      barcode: [''],
    });
  }

  ngOnInit() {
    this.getPurchases(this.purchasesPerPage, this.pageIndex, '');
    this.getNextRecordIdOfTable();
    this.getSupplier();
    this.getParentCategory();
    this.getUnits();
    this.getPurchaseOrders();
    this.getEmployees();
    // this.addPurchaseOrderItems(poId);
  }

  // POP-UP of adding Items in Purchase
  AddItems() {
    this.popup.options = {
      header: 'Add Items',
      color: '#dd4b39', // red, blue....
      widthProsentage: 80, // The with of the popou measured by browser width
      animationDuration: 0.5, // in seconds, 0 = no animation
      showButtons: false, // You can hide this in case you want to use custom buttons
      // confirmBtnContent: 'Add', // The text on your confirm button
      // cancleBtnContent: 'Cancel', // the text on your cancel button
      // confirmBtnClass: 'btn btn-default', // your class for styling the confirm button
      // cancleBtnClass: 'btn btn-default', // you class for styling the cancel button
      animation: 'fadeInDown' // 'fadeInLeft', 'fadeInRight', 'fadeInUp', 'bounceIn','bounceInDown'
    };
    this.popup.show();
  }
  Show() {
    this.popup.hide();
  }

  onEnter(value: string) {
    this.getPurchases(this.purchasesPerPage, this.pageIndex, value);
  }

  getPage(page: number) {
    this.pageIndex = page;
    this.getPurchases(this.purchasesPerPage, this.pageIndex, '');
  }

  setPurchasesPerPage() {
    this.purchasesPerPage = this.ddlpurchasesPerPage;
    this.getPurchases(this.purchasesPerPage, this.pageIndex, '');
  }

  getPurchases(purchasesPerPage: number, pageIndex: number, searchkey: any) {
    this.purchaseService.getPurchaseEntriesPaginate(purchasesPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
      data => {
        this.purchases = data['data'];
        this.totalPurchases = data['total'];
        this.last_page = data['last_page'];
      },
      err => { }
    );
  }
  getNextRecordIdOfTable() {
    this.commonService.getLastNextRecordId('purchases').subscribe(
      res => {
        this.nextRecordId = res;
      },
      err => { }
    );
  }

  autoCompleteList = (data: any) => {
    const html = `<span style='width:13%; display: inline-block'>${data.itemName}</span>`;
    return this.dSanitizer.bypassSecurityTrustHtml(html);
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

  getEmployees() {
    this.employeeService.getAllEmployees().subscribe(data => {
      const employees = data;
      this.employees = employees.filter(x => x.active === true && x.stylist === false);
    },
      err => { });
  }
  getUnits() {
    this.unitService.getUnit().subscribe(data => {
      this.units = data;
    },
      err => { });
  }

  getPurchaseOrders() {
    this.purchaseOrderService.getPurchaseOrders().subscribe(data => {
      this.purchaseOrders = data;
    },
      err => { });
  }

  selectedItems(item) {
    if (typeof (item) !== 'string') {
      this.getChildCategory(item.category.parent_category);
      this.itemForm.patchValue({
        parentCategory: item.category.parent_category,
        category: item.category.id,
        item: item,
        productCode: item.productCode,
        unitId: item.unit.id,
        mrp: item.salePrice,
        rate: item.costPrice,
        cp_vat: item.cp_vat,
        product_code: item.productCode,
        stock: item.stock,
        barcode: item.barcode
      });
      if (this.formEditMode) {
        this.itemForm.patchValue({
          'itemId': item.id
        });
      }
    }
  }
  getTotalAmount() {
    const quantity = this.itemForm.get('quantity').value;
    const rate = this.itemForm.get('rate').value;
    const tAmount = quantity * parseFloat(rate);
    this.total_amount = tAmount;
    const discRate = this.itemForm.get('discount_rate').value;
    const discAmount = ((rate * discRate) / 100);
    this.itemForm.get('total_discount').setValue(parseFloat(discAmount.toString()).toFixed(2));
    // this.itemForm.get('total_amount').setValue(parseFloat((this.total_amount).toString()).toFixed(2));
    this.itemForm.get('total_amount').setValue(this.total_amount);
  }

  getPurchaseItemList(): FormArray {
    return <FormArray>this.form.controls['purchaseItems'];
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
      unitId: new FormControl(item.unit.id),
      discount_rate: new FormControl(item.discount_rate),
      rate: new FormControl(item.rate),
      cp_vat: new FormControl(item.cp_vat),
      quantity: new FormControl(item.quantity),
      total_discount: new FormControl(item.total_discount),
      total_amount: new FormControl(item.total_amount),
      // total_amount: new FormControl(this.calculateItemAmount(item.quantity, item.rate)),
      mrp: new FormControl(item.mrp),
      itemName: new FormControl(item.itemName),
      purchaseId: new FormControl(''),
      stock: new FormControl(item.stock),
      barcode: new FormControl(item.barcode),
      deleted: new FormControl(false)
    });

  }

  markRequiredFieldsAsDirty() {
    this.form.get('mrn_date').markAsDirty();
    this.form.get('supplier_bill_date').markAsDirty();
    this.form.get('supplierId').markAsDirty();
    this.form.get('supplier_bill_no').markAsDirty();
    this.form.get('purchase_mode').markAsDirty();
    this.form.get('received_by').markAsDirty();
  }

  markRequiredItemFieldsAsDirty() {
    this.itemForm.get('quantity').markAsDirty();
    this.itemForm.get('cp_vat').markAsDirty();
    this.itemForm.get('rate').markAsDirty();
    // this.itemForm.markAsDirty();
    // this.itemForm.updateValueAndValidity();
  }

  addPurchaseOrderItems(poId) {
    this.markRequiredFieldsAsDirty();
    this.purchaseOrderService.getOrderById(poId).subscribe(
      item => {
        this.itemIngredients = this.getPurchaseItemList();
        if (item['purchase_order_items'] !== null) {
          item['purchase_order_items'].forEach(poItem => {
            this.itemIngredients.push(
              this.fb.group({
                id: new FormControl(''),
                itemObj: new FormControl(poItem.item),
                itemId: new FormControl(poItem.itemId),
                unitId: new FormControl(poItem.item.unit.id),
                discount_rate: 0,
                total_discount: new FormControl(poItem.total_discount),
                mrp: new FormControl(poItem.item.salePrice),
                rate: new FormControl(poItem.item.costPrice),
                cp_vat: new FormControl(poItem.item.cp_vat),
                quantity: new FormControl(poItem.quantity),
                itemName: new FormControl(poItem.itemName),
                total_amount: new FormControl(this.calculateItemAmount(poItem.quantity, poItem.item.costPrice)),
                // total_amount: new FormControl(poItem.total_amount),
                deleted: new FormControl(false),
              })
            );
            this.purchaseList.push(poItem);
            this.getVatAmount();
            this.getSubTotalAmount();
            this.getAmountCalculated();
            this.getFinalBillAmount();
          });

        }
      }

    );
  }

  changeQtyRateCalculation() {
    let vat_amt = 0.00;

    for (let i = 0; i < this.purchaseList.length; i++) {
      if (this.getPurchaseItemList().at(i).get('deleted').value === false) {
        const qty = parseFloat(this.getPurchaseItemList().at(i).get('quantity').value);
        const rate = parseFloat(this.getPurchaseItemList().at(i).get('rate').value);
        const total = qty * rate;
        this.getPurchaseItemList().at(i).get('total_amount').setValue(total);
        const vat = parseFloat(this.getPurchaseItemList().at(i).get('cp_vat').value);
        const vAmount = parseFloat(this.getPurchaseItemList().at(i).get('total_amount').value);
        let vatAmount = (vAmount * vat) / (100 + vat);
        vat_amt = vat_amt + vatAmount;
      }
    }
    this.form.get('vat_amount').setValue(parseFloat(vat_amt.toString()).toFixed(2));
    this.getSubTotalAmount();
    this.getAmountCalculated();
    this.getFinalBillAmount();
  }
  addArrayList() {
    this.markRequiredItemFieldsAsDirty();
    if (this.itemForm.valid) {
      const ingredient = this.itemForm.get('item').value;
      if (typeof (ingredient) !== 'string' && ingredient !== null) {
        if (this.purchaseList.length !== 0) {
          const duplicate = this.purchaseList.filter(item => item.barcode === ingredient.barcode);

          if (duplicate.length !== 0) {
            const index = this.purchaseList.findIndex(x => x.barcode === duplicate[0].barcode);
            const quantity = this.itemForm.get('quantity').value;
            const rate = this.itemForm.get('rate').value;
            const mrp = this.itemForm.get('mrp').value;
            const cpVat = this.itemForm.get('cp_vat').value;
            const discount_rate = this.itemForm.get('discount_rate').value;
            const totalamount = this.itemForm.get('total_amount').value;
            const total_discount = this.itemForm.get('total_discount').value;
            this.itemIngredients = this.getPurchaseItemList();
            this.form.get(['purchaseItems', index, 'quantity']).setValue(quantity);
            this.form.get(['purchaseItems', index, 'rate']).setValue(rate);
            this.form.get(['purchaseItems', index, 'mrp']).setValue(mrp);
            this.form.get(['purchaseItems', index, 'cp_vat']).setValue(cpVat);
            this.form.get(['purchaseItems', index, 'discount_rate']).setValue(discount_rate);
            this.form.get(['purchaseItems', index, 'total_amount']).setValue(totalamount);
            this.form.get(['purchaseItems', index, 'total_discount']).setValue(total_discount);
          } else {
            ingredient['quantity'] = this.itemForm.get('quantity').value;
            ingredient['rate'] = this.itemForm.get('rate').value;
            ingredient['mrp'] = this.itemForm.get('mrp').value;
            ingredient['cp_vat'] = this.itemForm.get('cp_vat').value;
            ingredient['discount_rate'] = this.itemForm.get('discount_rate').value;
            ingredient['total_amount'] = this.itemForm.get('total_amount').value;
            ingredient['total_discount'] = this.itemForm.get('total_discount').value;
            this.purchaseList.push(ingredient);
            this.itemIngredients = this.getPurchaseItemList();
            this.itemIngredients.push(this.itemArrayList(ingredient));
          }
        } else {
          ingredient['quantity'] = this.itemForm.get('quantity').value;
          ingredient['rate'] = this.itemForm.get('rate').value;
          ingredient['mrp'] = this.itemForm.get('mrp').value;
          ingredient['cp_vat'] = this.itemForm.get('cp_vat').value;
          ingredient['discount_rate'] = this.itemForm.get('discount_rate').value;
          ingredient['total_amount'] = this.itemForm.get('total_amount').value;
          ingredient['total_discount'] = this.itemForm.get('total_discount').value;
          this.purchaseList.push(ingredient);
          this.itemIngredients = this.getPurchaseItemList();
          this.itemIngredients.push(this.itemArrayList(ingredient));
        }
      }
    }
    this.changeQtyRateCalculation();
    this.searchbox = '';
    this.emptyAll();
  }

  calculateItemAmount(quantity, rate): any {
    let totalAmount = quantity * rate;
    return parseFloat(totalAmount.toString()).toFixed(2);
  }
  emptyAll() {
    this.itemForm.reset();
    this.itemForm.get('quantity').setValue(0);
    this.itemForm.get('total_amount').setValue(0.00);
    this.itemForm.get('discount_rate').setValue(0.00);
  }

  resetItemForm() {
    this.searchbox = '';
    this.itemForm.reset();
    this.itemForm.get('quantity').setValue(0);
    this.itemForm.get('total_amount').setValue(0.00);
  }

  deleteItems(i: number) {
    // // CP VAT Amount calculation 
    const vat = parseFloat(this.getPurchaseItemList().at(i).get('cp_vat').value);
    const Amount = parseFloat(this.getPurchaseItemList().at(i).get('total_amount').value);
    let vatAmount = (Amount * vat) / (100 + vat);
    const vmt = this.form.get('vat_amount').value;
    const vamount = (vmt) - vatAmount;
    this.form.get('vat_amount').setValue(parseFloat(vamount.toString()).toFixed(2));
    // //Sub Total calculation

    const subtotal = this.form.get('sub_total').value;
    const total_amount = this.getPurchaseItemList().at(i).get('total_amount').value;
    const sbTotal = subtotal - (total_amount - vatAmount);
    this.form.get('sub_total').setValue(parseFloat(sbTotal.toString()).toFixed(2));

    // // Discount amount calculation
    const dAmount = this.form.get('discount_amount').value;
    const tDiscount = this.getPurchaseItemList().at(i).get('total_discount').value;
    const qty = this.getPurchaseItemList().at(i).get('quantity').value;
    const discAmount = parseFloat(tDiscount) * qty;
    const total_discount = dAmount - discAmount;
    this.form.get('discount_amount').setValue(parseFloat(total_discount.toString()).toFixed(2));

    //Delete Item
    this.purchaseList.splice(i, 1);
    if (this.getPurchaseItemList().at(i).get('id').value !== '') {
      this.getPurchaseItemList().at(i).get('deleted').setValue(true);
    } else {
      this.getPurchaseItemList().removeAt(i);
    }

    //Bill Amount calculation
    this.getFinalBillAmount();

  }

  getVatAmount() {
    let vat_amt = 0;
    if (this.purchaseList !== null && this.purchaseList.length > 0) {
      for (let i = 0; i < this.purchaseList.length; i++) {
        if (this.getPurchaseItemList().at(i).get('deleted').value === false) {
          const vat = parseFloat(this.getPurchaseItemList().at(i).get('cp_vat').value);
          const vAmount = parseFloat(this.getPurchaseItemList().at(i).get('total_amount').value);
          let vatAmount = (vAmount * vat) / (100 + vat);
          vat_amt = vat_amt + vatAmount;
        }
      }
      this.form.get('vat_amount').setValue(parseFloat(vat_amt.toString()).toFixed(2));
    }
  }
  getFinalBillAmount() {
    const extDiscount = this.form.get('extra_discount').value;
    this.form.get('extra_discount').setValue(extDiscount == '' || this.form.get('extra_discount').invalid ? 0 : extDiscount);
    let subtotal = parseFloat(this.form.get('sub_total').value);
    if (this.form.get('extra_discount').valid) {
      let discount_amount = parseFloat(this.form.get('discount_amount').value);
      let extra_discount = parseFloat(this.form.get('extra_discount').value);
      let vt_amount = parseFloat(this.form.get('vat_amount').value);
      let bill_amount = (subtotal + vt_amount) - (discount_amount + extra_discount);
      this.form.get('bill_amount').setValue(parseFloat(bill_amount.toString()).toFixed(2));
    }
  }

  getAmountCalculated() {
    // total Discount Calculation
    let i = 0;
    let totalDAmount = 0;
    for (i = 0; i < this.purchaseList.length; i++) {
      if (this.getPurchaseItemList().at(i).get('deleted').value === false) {
        const tDiscount = this.getPurchaseItemList().at(i).get('total_discount').value;
        const qty = this.getPurchaseItemList().at(i).get('quantity').value;
        this.discAmount = tDiscount * qty;
        totalDAmount = totalDAmount + this.discAmount;
      }
    }
    this.form.get('discount_amount').setValue(parseFloat(totalDAmount.toString()).toFixed(2));
  }

  getSubTotalAmount() {
    if (this.form.get('poId').value !== null) {
      let i = 0;
      if (this.purchaseList !== null && this.purchaseList.length > 0) {
        for (i = 0; i < this.purchaseList.length; i++) {
          const qty = this.getPurchaseItemList().at(i).get('quantity').value;
          const rt = this.getPurchaseItemList().at(i).get('rate').value;
          const tAmount = qty * rt;
          this.itemForm.get('total_amount').setValue(tAmount);
        }
        let subTotal = 0;
        for (i = 0; i < this.purchaseList.length; i++) {
          const totalAmount = this.getPurchaseItemList().at(i).get('total_amount').value;
          subTotal = subTotal + parseFloat(totalAmount);
        }
        const vatAmt = this.form.get('vat_amount').value;
        const sTotal = subTotal - vatAmt;
        this.form.get('sub_total').setValue(parseFloat(sTotal.toString()).toFixed(2));
      }
    }
    else {
      if (this.formEditMode !== true) {
        let total = 0;
        if (this.purchaseList !== null && this.purchaseList.length > 0) {
          this.purchaseList.forEach(st => total += st.total_amount);
        }
        const vatAmt = this.form.get('vat_amount').value;
        const sTotal = total - vatAmt;
        this.form.get('sub_total').setValue(parseFloat(sTotal.toString()).toFixed(2));
      } else {
        if (this.purchaseList !== null && this.purchaseList.length > 0) {
          let subTotal = 0;
          for (let i = 0; i < this.purchaseList.length; i++) {
            if (this.getPurchaseItemList().at(i).get('deleted').value === false) {
              const totalAmount = this.getPurchaseItemList().at(i).get('total_amount').value;
              subTotal = subTotal + totalAmount;
            }
          }

          const vatAmt = this.form.get('vat_amount').value;
          const sTotal = subTotal - vatAmt;
          this.form.get('sub_total').setValue(parseFloat(sTotal.toString()).toFixed(2));
        }
      }
    }
  }

  onSubmit() {
    this.markRequiredFieldsAsDirty();
    const pOItem = this.form.get('purchaseItems').value;
    if (pOItem.length !== null && pOItem.length !== 0) {
      const formData = this.form.value;
      if (this.form.valid) {
        if (this.form.get('mrn_date').value !== '' && this.form.get('mrn_date') !== null) {
          const purchaseDate = this.form.get('mrn_date').value.date;
          const mrnDate = moment(new Date(purchaseDate.year, purchaseDate.month - 1, purchaseDate.day)).format('YYYY-MM-DD');
          formData['mrn_date'] = mrnDate;
        }
        if (this.form.get('supplier_bill_date').value !== '' && this.form.get('supplier_bill_date') !== null) {
          const sBillDate = this.form.get('supplier_bill_date').value.date;
          const sBDate = moment(new Date(sBillDate.year, sBillDate.month - 1, sBillDate.day)).format('YYYY-MM-DD');
          formData['supplier_bill_date'] = sBDate;
        }
        if (!this.formEditMode === true) {
          this.purchaseService.addPurchaseEntry(formData).subscribe(
            res => {
              if (res['status'] === 'success') {
                this.popToast('Purchase saved successfully', '');
                this.resetForm();
                this.getPurchases(this.purchasesPerPage, this.pageIndex, '');
                this.getNextRecordIdOfTable();
              }
            },
            err => {
              this.popToast('Unable to save purchase', '50');
            }
          );
        } else {
          const purchaseId = this.form.get('id').value;
          this.purchaseService.updatePurchaseEntry(purchaseId, formData).subscribe(
            res => {
              if (res.status === 'inValid') {
                this.popToast(res.errors.supplier_bill_no, '51');
              }
              else {
                this.formEditMode = false;
                this.popToast('Purchase updated successfully!!', '');
                this.resetForm();
                this.getPurchases(this.purchasesPerPage, this.pageIndex, '');
                this.getNextRecordIdOfTable();
              }
            },
            err => {
              this.popToast('Unable to update purchase !!', '50');
            }
          );
        }
      }
    } else {
      this.popToast('Purchase contains atleast one item', '51');
    }
  }

  resetItems() {
    const itemIngredients = this.getPurchaseItemList();
    for (let i = itemIngredients.controls.length - 1; i >= 0; i--) {
      itemIngredients.removeAt(i);
    }
  }

  dateFormat(pDate: string, sDate: string) {
    const mrn_date = new Date(pDate);
    const supplier_bill_date = new Date(sDate);
    this.form.patchValue({
      mrn_date: pDate !== null && pDate !== '' ? {
        date: {
          year: mrn_date.getFullYear(),
          month: mrn_date.getMonth() + 1,
          day: mrn_date.getDate()
        }
      } : '',
      supplier_bill_date: sDate !== null && sDate !== '' ? {
        date: {
          year: supplier_bill_date.getFullYear(),
          month: supplier_bill_date.getMonth() + 1,
          day: supplier_bill_date.getDate()
        }
      } : '',
    });
  }

  getEditPurchaseEntry(id: number) {
    this.show = true;
    this.resetItems();
    this.purchaseService.getPurchaseEntryById(id).subscribe(
      item => {
        this.formEditMode = true;
        this.nextRecordId = item.id;
        this.setFormData(item);
        this.itemIngredients = this.getPurchaseItemList();
        if (item['purchase_items'] !== null) {
          item['purchase_items'].forEach(data => {
            this.itemIngredients.push(
              this.fb.group({
                id: new FormControl(data.id),
                purchaseId: new FormControl(data.purchaseId),
                unitId: new FormControl(data.unitId),
                itemObj: new FormControl(data.item),
                itemId: new FormControl(data.itemId),
                discount_rate: new FormControl(data.discount_rate),
                total_discount: new FormControl(data.total_discount),
                // total_amount: new FormControl(this.calculateItemAmount(item.quantity, item.item.costPrice)),
                total_amount: new FormControl(data.total_amount),
                cp_vat: new FormControl(data.cp_vat),
                mrp: new FormControl(data.mrp),
                rate: new FormControl(data.rate, [Validators.required, CustomValidators.decimalValidate]),
                quantity: new FormControl(data.quantity, [Validators.required, Validators.min(1), CustomValidators.OnlyNumericValidate]),
                itemName: new FormControl(data.itemName),
                deleted: new FormControl(false),
              })
            );
            this.purchaseList.push(data.item);
          });
        }
      },
      err => { }
    );
  }

  setFormData(purchase: Purchase) {
    this.form.get('id').setValue(purchase.id);
    this.form.get('supplierId').setValue(purchase.supplierId);
    this.form.get('supplier_bill_no').setValue(purchase.supplier_bill_no);
    this.form.get('poId').setValue(purchase.poId);
    this.dateFormat(purchase.mrn_date, purchase.supplier_bill_date);
    this.form.get('received_by').setValue(purchase.received_by);
    this.form.get('purchase_mode').setValue(purchase.purchase_mode);
    this.form.get('sub_total').setValue(purchase.sub_total);
    this.form.get('vat_amount').setValue(purchase.vat_amount);
    this.form.get('discount_amount').setValue(purchase.discount_amount);
    this.form.get('extra_discount').setValue(purchase.extra_discount);
    this.form.get('bill_amount').setValue(purchase.bill_amount);
  }

  deletePurchase(id: string) {
    this.purchaseService.deletePurchaseEntry(id).subscribe(data => {
      this.popToast('Purchase order deleted successfully !!', '');
      this.getPurchases(this.purchasesPerPage, this.pageIndex, '');
    }, err => {
      this.popToast('Unable to delete purchase order', '50');
      this.getPurchases(this.purchasesPerPage, this.pageIndex, '');
    });
  }

  openImportItemsDialog() {
    const event = new MouseEvent('click', { bubbles: true });
    this.renderer.invokeElementMethod(
      this.importItemsfileInput.nativeElement, 'dispatchEvent', [event]);
  }

  readExcelFile($event): void {
    this.readThis($event.target);
    this.uploadExcelItems();
  }

  readThis(inputValue: any): void {
    const fileList: FileList = inputValue.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.append('items_import_file', file, file.name);
      this.fileData = formData;
    }

  }

  uploadExcelItems() {
    // const ingredient = this.itemForm.get('poItem').value;
    this.purchaseService.uploadItemsExcelData(this.fileData).subscribe(
      item => {
        this.itemIngredients = this.getPurchaseItemList();
        if (item['data'] !== null) {
          item['data'].forEach(data => {
            this.itemIngredients.push(
              this.fb.group({
                id: new FormControl(''),
                itemObj: new FormControl(data),
                itemId: new FormControl(data.id),
                barcode: new FormControl(data.barcode),
                discount_rate: 0,
                total_discount: new FormControl(data.total_discount),
                total_amount: new FormControl(this.calculateItemAmount(data.qty, data.costPrice)),
                categorie: new FormControl(data.category),
                itemType: new FormControl(data.itemType),
                mrp: new FormControl(data.salePrice),
                rate: new FormControl(data.costPrice),
                cp_vat: new FormControl(data.cp_vat),
                unitId: new FormControl(data.unit),
                quantity: new FormControl(data.qty),
                itemName: new FormControl(data.itemName),
                unit: new FormControl(data.unit),
                deleted: new FormControl(false),
              })
            );
            this.purchaseList.push(data);
            this.getVatAmount();
            this.getSubTotalAmount();
            this.getAmountCalculated();
            this.getFinalBillAmount();
          });

        }

        // this.itemIngredients.push(this.itemArrayList(res));
        if (item['status'] === 'success') {
          this.toasterService.pop({
            type: 'success', title: 'Purchase',
            body: item['msg']
          });
        } else if (item['status'] === 'warning') {
          this.toasterService.pop({
            type: 'warning', title: 'Purchase',
            body: item['msg']
          });
        }

      }

    );
  }
  resetForm() {
    this.show = false;
    this.formEditMode = false;
    this.searchbox = '';
    this.form.reset();
    this.resetItems();
    this.purchaseList = [];
    this.form.get('bill_amount').setValue(0.00);
    this.form.get('vat_amount').setValue(0.00);
    this.form.get('extra_discount').setValue(0.00);
    this.form.get('sub_total').setValue(0.00);
    this.form.get('discount_amount').setValue(0.00);

  }
  reset() {
    this.form.reset();
    this.resetItems();
    this.purchaseList = [];
    this.form.get('bill_amount').setValue(0.00);
    this.form.get('vat_amount').setValue(0.00);
    this.form.get('extra_discount').setValue(0.00);
    this.form.get('sub_total').setValue(0.00);
    this.form.get('discount_amount').setValue(0.00);
  }
}

