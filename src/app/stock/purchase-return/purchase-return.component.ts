import { Component, OnInit } from '@angular/core';
import { IMyDpOptions } from 'mydatepicker';
import { Popup } from 'ng2-opd-popup';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ToasterService, Toast, BodyOutputType } from 'angular2-toaster';
import { CategoryService } from '../../category/category.service';
import { PurchaseEntryService } from '../purchase-entry/purchase-entry.service';
import { ItemService } from '../../item/item.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../shared/common.service';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../employee/employee.service';
import { slideIn } from '../../shared/animation';
import { PurchaseReturn } from './purchase-return';
import { Purchase } from '../purchase-entry/purchase-entry';
import { Category } from '../../category/category';
import { Employee } from '../../employee/employee';
import { CustomValidators } from '../../shared/customevalidators';
import { PurchaseReturnService } from './purchase-return.service';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { SupplierService } from '../../supplier/supplier.service';
import { Supplier } from '../../supplier/supplier';
import { UnitService } from '../../unit/unit.service';
import { Unit } from '../../unit/unit';


@Component({
  selector: 'app-purchase-return',
  templateUrl: './purchase-return.component.html',
  styleUrls: ['./purchase-return.component.css'],
  providers: [
    { provide: 'Window', useValue: window }
  ],
  animations: [slideIn]
})
export class PurchaseReturnComponent implements OnInit {

  model: any;
  formEditMode = false;
  show = false;
  form: FormGroup;
  itemForm: FormGroup;
  purchaseReturns: PurchaseReturn[];
  purchases: Purchase[];
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
  employees: Employee[];
  suppliers: Supplier[];
  units: Unit[];
  nextRecordId = 0;
  itemIngredients: any;
  sBillDate: any;
  purchaseReturnItems = [];

  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    height: '28px'
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
      title: 'Purchase Return',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };
    this.toasterService.pop(toast);
  }

  constructor(private popup: Popup, private formBuilder: FormBuilder, private toasterService: ToasterService, private catService: CategoryService, private purchaseService: PurchaseEntryService,
    private itemService: ItemService, private dSanitizer: DomSanitizer, private commonService: CommonService, private routeService: ActivatedRoute, private employeeService: EmployeeService,
    private purchaseReturnService: PurchaseReturnService, private supplierService: SupplierService, private unitService: UnitService) {
    this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params).distinctUntilChanged().subscribe(data => {
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, '');
      });
    this.sortCol = 'id';
    this.sortDir = 'asc';
    this.ddlpurchasesPerPage = this.purchasesPerPage;
    this.form = formBuilder.group({
      id: [''],
      return_date: ['', [Validators.required]],
      supplierId: ['', [Validators.required]],
      supplier_bill_no: ['', [Validators.required]],
      purchaseEId: ['1', [Validators.required]],
      supplier_bill_date: [''],
      return_through: ['', [Validators.required]],
      sub_total: ['0.00'],
      vat_amount: ['0.00'],
      discount_amount: ['0.00'],
      extra_discount: ['0', CustomValidators.decimalValidate],
      bill_amount: ['0.00'],
      purchase_return_items: formBuilder.array([])
    });

    this.itemForm = formBuilder.group({
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
      total_vat: ['0.00'],
      discount_rate: ['0.00', [CustomValidators.decimalValidate]],
      quantity: ['0', [Validators.required, CustomValidators.OnlyNumericValidate, CustomValidators.zeroNotAllowed]],
      itemName: [''],
    });
  }

  ngOnInit() {
    this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, '');
    this.getNextRecordIdOfTable();
    this.getParentCategory();
    this.getSupplier();
    this.getUnits();
    // this.getPurchases();
  }
  AddItems() {
    this.popup.options = {
      header: 'Add Items',
      color: '#dd4b39', // red, blue....
      widthProsentage: 80, // The with of the popou measured by browser width
      animationDuration: 0.5, // in seconds, 0 = no animation
      showButtons: false, // You can hide this in case you want to use custom buttons
      // confirmBtnContent: 'Add', // The text on your confirm button
      //cancleBtnContent: 'Cancel', // the text on your cancel button
      // confirmBtnClass: 'btn btn-default', // your class for styling the confirm button
      //  cancleBtnClass: 'btn btn-default', // you class for styling the cancel button
      animation: 'fadeInDown' // 'fadeInLeft', 'fadeInRight', 'fadeInUp', 'bounceIn','bounceInDown'
    };
    this.popup.show();
  }
  Show() {
    this.popup.hide();
  }

  onEnter(value: string) {
    this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, value);
  }
  getPage(page: number) {
    this.pageIndex = page;
    this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, '');
  }

  setOrdersPerPage() {
    this.purchasesPerPage = this.ddlpurchasesPerPage;
    this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, '');
  }
  getPurchaseReturn(purchasesPerPage: number, pageIndex: number, searchkey: any) {
    this.purchaseReturnService.getPurchaseReturnPaginate(purchasesPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
      data => {
        this.purchaseReturns = data['data'];
        this.totalPurchases = data['total'];
        this.last_page = data['last_page'];
      },
      err => { }
    );
  }

  getNextRecordIdOfTable() {
    this.commonService.getLastNextRecordId('purchase_returns').subscribe(
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

  getPurchases() {
    this.purchaseService.getPurchases().subscribe(data => {
      this.purchases = data;
    },
      err => { });
  }

  getUnits() {
    this.unitService.getUnit().subscribe(data => {
      this.units = data;
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

  // getTotalAmount() {
  //   //Total Amount Calculation
  //   const quantity = this.itemForm.get('quantity').value;
  //   const rate = this.itemForm.get('rate').value;
  //   const tAmount = quantity * parseFloat(rate);

  //   //VAT Amount Calculation
  //   const vat = this.itemForm.get('cp_vat').value;
  //   let vatAmount = (tAmount * vat) / (100 + vat);
  //   const discRate = this.itemForm.get('discount_rate').value;
  //   const discAmount = ((rate * discRate) / 100);
  //   this.itemForm.get('total_discount').setValue(parseFloat(discAmount.toString()).toFixed(2));
  //   this.itemForm.get('total_vat').setValue(parseFloat(vatAmount.toString()).toFixed(2));
  //   this.itemForm.get('total_amount').setValue(parseFloat((tAmount).toString()).toFixed(2));
  // }

  getPurchaseReturnList(): FormArray {
    return <FormArray>this.form.controls['purchase_return_items'];
  }
  itemArrayList(item: any): FormGroup {
    return this.formBuilder.group({
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
      mrp: new FormControl(item.mrp),
      itemName: new FormControl(item.itemName),
      purchaseRId: new FormControl(''),
      stock: new FormControl(item.stock),
      barcode: new FormControl(item.barcode),
      deleted: new FormControl(false)
    });
  }

  calculateItemAmount(quantity, rate): any {
    let totalAmount = quantity * rate;
    return parseFloat(totalAmount.toString()).toFixed(2);
  }

  // addArrayList() {

  //   if (this.itemForm.valid) {
  //     const ingredient = this.itemForm.get('item').value;
  //     if (typeof (ingredient) !== 'string' && ingredient !== null) {
  //       if (this.getPurchaseReturnList().length !== 0) {
  //         const duplicate = ingredient.filter(item => item.barcode === ingredient.barcode);

  //         if (duplicate.length !== 0) {
  //           const index = ingredient.findIndex(x => x.barcode === duplicate[0].barcode);
  //           const quantity = this.itemForm.get('quantity').value;
  //           const rate = this.itemForm.get('rate').value;
  //           const mrp = this.itemForm.get('mrp').value;
  //           const cpVat = this.itemForm.get('cp_vat').value;
  //           const discount_rate = this.itemForm.get('discount_rate').value;
  //           const totalamount = this.itemForm.get('total_amount').value;
  //           const total_discount = this.itemForm.get('total_discount').value;
  //           const total_vat = this.itemForm.get('total_vat').value;
  //           this.itemIngredients = this.getPurchaseReturnList();
  //           this.form.get(['purchaseItems', index, 'quantity']).setValue(quantity);
  //           this.form.get(['purchaseItems', index, 'rate']).setValue(rate);
  //           this.form.get(['purchaseItems', index, 'mrp']).setValue(mrp);
  //           this.form.get(['purchaseItems', index, 'cp_vat']).setValue(cpVat);
  //           this.form.get(['purchaseItems', index, 'total_vat']).setValue(total_vat);
  //           this.form.get(['purchaseItems', index, 'discount_rate']).setValue(discount_rate);
  //           this.form.get(['purchaseItems', index, 'total_amount']).setValue(totalamount);
  //           this.form.get(['purchaseItems', index, 'total_discount']).setValue(total_discount);
  //         } else {
  //           ingredient['quantity'] = this.itemForm.get('quantity').value;
  //           ingredient['rate'] = this.itemForm.get('rate').value;
  //           ingredient['mrp'] = this.itemForm.get('mrp').value;
  //           ingredient['cp_vat'] = this.itemForm.get('cp_vat').value;
  //           ingredient['total_vat'] = this.itemForm.get('total_vat').value;
  //           ingredient['discount_rate'] = this.itemForm.get('discount_rate').value;
  //           ingredient['total_amount'] = this.itemForm.get('total_amount').value;
  //           ingredient['total_discount'] = this.itemForm.get('total_discount').value;
  //           // this.purchaseList.push(ingredient);
  //           this.itemIngredients = this.getPurchaseReturnList();
  //           this.itemIngredients.push(this.itemArrayList(ingredient));
  //         }
  //       } else {
  //         ingredient['quantity'] = this.itemForm.get('quantity').value;
  //         ingredient['rate'] = this.itemForm.get('rate').value;
  //         ingredient['mrp'] = this.itemForm.get('mrp').value;
  //         ingredient['cp_vat'] = this.itemForm.get('cp_vat').value;
  //         ingredient['total_vat'] = this.itemForm.get('total_vat').value;
  //         ingredient['discount_rate'] = this.itemForm.get('discount_rate').value;
  //         ingredient['total_amount'] = this.itemForm.get('total_amount').value;
  //         ingredient['total_discount'] = this.itemForm.get('total_discount').value;
  //         // this.purchaseList.push(ingredient);
  //         this.itemIngredients = this.getPurchaseReturnList();
  //         this.itemIngredients.push(this.itemArrayList(ingredient));
  //       }
  //       this.searchbox = '';
  //       this.emptyAll();
  //     }
  //   }
  // }

  // emptyAll() {
  //   this.itemForm.reset();
  //   this.itemForm.get('total_amount').setValue(0.00);
  //   this.itemForm.get('cp_vat').setValue(0.00);
  //   this.itemForm.get('quantity').setValue(0);
  //   this.itemForm.get('discount_rate').setValue(0.00);
  //   this.itemForm.get('total_discount').setValue(0.00);
  //   this.itemForm.get('total_vat').setValue(0.00);
  // }

  getBillNoAndDate() {
    const sp = this.form.get('supplierId').value;
    this.purchaseService.getPurchaseBySupplier(sp).subscribe(data => {
      this.purchases = data;
    });
  }

  getBillDate() {
    const sp = this.form.get('supplierId').value;
    const sNo = this.form.get('supplier_bill_no').value;
    this.purchaseService.getPurchaseBySupplier(sp).subscribe(data => {
      this.purchases = data;
      if (this.purchases !== null) {
        this.purchases.forEach(item => {
          if (sNo == item.id) {
            this.sBillDate = [item];
          }
        })
      }
    });
  }
  getPurchaseData() {
    // this.resetItems();
    const pId = this.form.get('supplier_bill_no').value;
    this.purchaseService.getPurchaseEntryById(pId).subscribe(item => {
      this.itemIngredients = this.getPurchaseReturnList();
      if (item['purchase_items'] !== null) {
        item['purchase_items'].forEach(data => {
          this.itemIngredients.push(
            this.formBuilder.group({
              id: new FormControl(''),
              itemObj: new FormControl(data.item),
              itemId: new FormControl(data.itemId),
              unitId: new FormControl(data.item.unit.id),
              discount_rate: new FormControl(data.discount_rate),
              total_discount: new FormControl(data.total_discount),
              mrp: new FormControl(data.mrp),
              rate: new FormControl(data.rate),
              cp_vat: new FormControl(data.cp_vat),
              quantity: new FormControl(data.quantity),
              itemName: new FormControl(data.itemName),
              total_amount: new FormControl(data.total_amount),
              deleted: new FormControl(false),
            })
          )
          this.purchaseReturnItems.push(data.item);
          this.getAllCalculations();
        })
      }
    })
  }

  getAllCalculations() {
    let vat_amt = 0;
    let subTotal = 0;
    let totalDAmount = 0;
    if (this.purchaseReturnItems !== null && this.purchaseReturnItems.length > 0) {
      for (let i = 0; i < this.purchaseReturnItems.length; i++) {
        if (this.getPurchaseReturnList().at(i).get('deleted').value === false) {

          //VAT Amount Calculation
          const vat = parseFloat(this.getPurchaseReturnList().at(i).get('cp_vat').value);
          const amount = parseFloat(this.getPurchaseReturnList().at(i).get('total_amount').value);
          let vatAmount = (amount * vat) / (100 + vat);
          this.itemForm.get('total_vat').setValue(vatAmount);
          vat_amt = vat_amt + vatAmount;

          //SubTotal Calculation
          subTotal = subTotal + amount;

          //Discount Amount Calculation
          const tDiscount = this.getPurchaseReturnList().at(i).get('total_discount').value;
          const qty = this.getPurchaseReturnList().at(i).get('quantity').value;
          const discAmount = tDiscount * qty;
          totalDAmount = totalDAmount + discAmount;
        }
      }
    }
    //subTotal & vat Calculation
    const sTotal = subTotal - vat_amt;

    this.form.get('vat_amount').setValue(parseFloat(vat_amt.toString()).toFixed(2));
    this.form.get('sub_total').setValue(parseFloat(sTotal.toString()).toFixed(2));
    this.form.get('discount_amount').setValue(parseFloat(totalDAmount.toString()).toFixed(2));
    this.getFinalBillAmount();
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

  getChangeQuantityCalculations() {
    for (let i = 0; i < this.purchaseReturnItems.length; i++) {
      if (this.getPurchaseReturnList().at(i).get('deleted').value === false) {
        const qty = parseFloat(this.getPurchaseReturnList().at(i).get('quantity').value);
        const rate = parseFloat(this.getPurchaseReturnList().at(i).get('rate').value);
        const total = qty * rate;
        this.getPurchaseReturnList().at(i).get('total_amount').setValue(total);
      }
    }
    this.getAllCalculations();
  }

  deleteItems(i: number) {
    // // CP VAT Amount calculation 
    const vat = parseFloat(this.getPurchaseReturnList().at(i).get('cp_vat').value);
    const Amount = parseFloat(this.getPurchaseReturnList().at(i).get('total_amount').value);
    let vatAmount = (Amount * vat) / (100 + vat);
    const vmt = this.form.get('vat_amount').value;
    const vamount = (vmt) - vatAmount;
    this.form.get('vat_amount').setValue(parseFloat(vamount.toString()).toFixed(2));
    // //Sub Total calculation

    const subtotal = this.form.get('sub_total').value;
    const total_amount = this.getPurchaseReturnList().at(i).get('total_amount').value;
    const sbTotal = subtotal - (total_amount - vatAmount);
    this.form.get('sub_total').setValue(parseFloat(sbTotal.toString()).toFixed(2));

    // // Discount amount calculation
    const dAmount = this.form.get('discount_amount').value;
    const tDiscount = this.getPurchaseReturnList().at(i).get('total_discount').value;
    const qty = this.getPurchaseReturnList().at(i).get('quantity').value;
    const discAmount = parseFloat(tDiscount) * qty;
    const total_discount = dAmount - discAmount;
    this.form.get('discount_amount').setValue(parseFloat(total_discount.toString()).toFixed(2));

    //Delete Item
    this.purchaseReturnItems.splice(i, 1);
    if (this.getPurchaseReturnList().at(i).get('id').value !== '') {
      this.getPurchaseReturnList().at(i).get('deleted').setValue(true);
    } else {
      this.getPurchaseReturnList().removeAt(i);
    }

    //Bill Amount calculation
    this.getFinalBillAmount();

  }

  markRequiredFieldsAsDirty() {
    this.form.get('return_date').markAsDirty();
    this.form.get('supplierId').markAsDirty();
    // this.form.get('supplier_bill_date').markAsDirty();
    this.form.get('supplier_bill_no').markAsDirty();
    this.form.get('return_through').markAsDirty();
  }

  onSubmit() {
    console.log(this.form.value);
    console.log(this.form.get('supplier_bill_date').value);
    this.markRequiredFieldsAsDirty();
    const pReturnItem = this.form.get('purchase_return_items').value;
    console.log(pReturnItem);
    if (pReturnItem.length !== null && pReturnItem.length !== 0) {
      const formData = this.form.value;

      if (this.form.valid) {
        if (this.form.get('return_date').value !== '' && this.form.get('return_date') !== null) {
          const pReturnDate = this.form.get('return_date').value.date;
          const pDate = moment(new Date(pReturnDate.year, pReturnDate.month - 1, pReturnDate.day)).format('YYYY-MM-DD');
          formData['return_date'] = pDate;
        }
        if (!this.formEditMode === true) {
          console.log(formData);
          this.purchaseReturnService.addPurchasereturn(formData).subscribe(
            res => {
              if (res['status'] === 'success') {
                this.popToast('Purchase Return saved successfully', '');
                this.resetForm();
                this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, '');
                this.getNextRecordIdOfTable();
              }
            },
            err => {
              this.popToast('Unable to save purchase return', '50');
            }
          );
        } else {
          // const st = this.form.get('status').value;
          const purchase_order_id = this.form.get('id').value;
          this.purchaseReturnService.updatePurchaseReturn(formData, purchase_order_id).subscribe(
            res => {
              if (res['status'] === 'success') {
                this.formEditMode = false;
                this.popToast('Purchase return updated successfully!!', '');
                this.resetForm();
                this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, '');
                this.getNextRecordIdOfTable();
              }
            },
            err => {
              this.popToast('Unable to update purchase return!!', '50');
              this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, '');
            }
          );
        }
      }
    } else {
      this.popToast('Purchase return contains atleast one item', '51');
    }
  }

  dateFormat(pDate: string) {
    const purchase_return_date = new Date(pDate);
    this.form.patchValue({
      return_date: pDate !== null && pDate !== '' ? {
        date: {
          year: purchase_return_date.getFullYear(),
          month: purchase_return_date.getMonth() + 1,
          day: purchase_return_date.getDate()
        }
      } : '',
    });
  }

  resetItems() {
    const itemIngredients = this.getPurchaseReturnList();
    for (let i = itemIngredients.controls.length - 1; i >= 0; i--) {
      itemIngredients.removeAt(i);
    }
  }

  resetForm() {
    this.show = false;
    this.searchbox = '';
    this.formEditMode = false;
    this.form.reset();
    this.resetItems();
  }

  getEditPurchaseReturn(id: number) {
    this.show = true;
    this.resetItems();
    this.purchaseReturnService.getPurchaseReturnById(id).subscribe(
      item => {
        console.log(item);
        this.formEditMode = true;
        this.nextRecordId = item.id;
        // console.log(this.nextRecordId);
        this.setFormData(item);
        this.itemIngredients = this.getPurchaseReturnList();
        console.log(this.itemIngredients);
        if (item['purchase_return_items'] !== null) {
          item['purchase_return_items'].forEach(data => {
            this.itemIngredients.push(
              this.formBuilder.group({
                id: new FormControl(data.id),
                unitId: new FormControl(data.unitId),
                itemObj: new FormControl(data.item),
                itemId: new FormControl(data.itemId),
                discount_rate: new FormControl(data.discount_rate),
                total_discount: new FormControl(data.total_discount),
                total_amount: new FormControl(this.calculateItemAmount(data.quantity, data.item.costPrice)),
                cp_vat: new FormControl(data.cp_vat),
                total_vat: new FormControl(data.total_vat),
                mrp: new FormControl(data.mrp),
                rate: new FormControl(data.rate, [Validators.required, CustomValidators.decimalValidate]),
                quantity: new FormControl(data.quantity, [Validators.required, Validators.min(1), CustomValidators.OnlyNumericValidate]),
                itemName: new FormControl(data.itemName),
                deleted: new FormControl(false),
              })
            );
            // this.orderList.push(data.item);
          });
        }
      },
      err => { }
    );
  }

  setFormData(pReturn: PurchaseReturn) {
    this.form.get('id').setValue(pReturn.id);
    this.dateFormat(pReturn.return_date);
  }

  deletePurchaseReturn(id: string) {
    this.purchaseReturnService.deletePurchaseReturn(id).subscribe(data => {
      this.popToast('Purchase return deleted successfully !!', '');
      this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, '');
    }, err => {
      this.popToast('Unable to delete purchase return', '50');
      this.getPurchaseReturn(this.purchasesPerPage, this.pageIndex, '');
    });
  }
}
