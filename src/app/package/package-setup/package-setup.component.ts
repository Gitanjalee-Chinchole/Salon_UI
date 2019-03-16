import { Component, OnInit, Renderer } from '@angular/core';
import { PackageSetup } from './package-setup';
import { slideIn } from '../../shared/animation';
import { Toast, BodyOutputType, ToasterService, ToasterConfig } from 'angular2-toaster';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../shared/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ItemService } from '../../item/item.service';
import { PackageSetupService } from './package-setup.service';
import { CategoryService } from '../../category/category.service';
import { Category } from '../../category/category';
import { Observable } from 'rxjs/Rx';
import { CustomValidators } from '../../shared/customevalidators';
declare var require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');
declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-package-setup',
  templateUrl: './package-setup.component.html',
  styleUrls: ['./package-setup.component.css'],
  animations: [slideIn]
})
export class PackageSetupComponent implements OnInit {
  show = false;
  searchKey: any;
  sortCol: string;
  sortDir: string;
  queryParams: any;
  pageIndex = 1;
  ddlitemsPerPage: any;
  itemsPerPage = 10;
  totalItems = 0;
  last_page: number;
  packageSetup: PackageSetup[];
  packageSetupPDF: PackageSetup[];
  parentCategories: Category[];
  childCategories: Category[];
  searchbox = '';
  itemSearch: any;
  packageSetupForm: FormGroup;
  formEditMode = false;
  serviceList = [];
  itemIngredients: any;
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
      title: 'Package Setup',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };

    this.toasterService.pop(toast);
  }
  constructor(private fb: FormBuilder, private toasterService: ToasterService,
    private routeService: ActivatedRoute, private packageSetupService: PackageSetupService,
    private _commonService: CommonService, private _sanitizer: DomSanitizer,
    private _itemService: ItemService, private renderer: Renderer, private _categoryService: CategoryService) {
    this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
      });
    this.sortDir = 'asc';
    this.sortCol = 'id';
    this.ddlitemsPerPage = this.itemsPerPage;
    this.packageSetupForm = fb.group({
      'id': [],
      'packageName': ['', [Validators.required, CustomValidators.nospaceValidator]],
      'validFor': ['', [Validators.required, CustomValidators.OnlyNumericValidate]],
      'packageCommission': ['', [CustomValidators.decimalValidate]],
      'totalCost': ['', [CustomValidators.decimalValidate]],
      'parentCategory': ['0'],
      'category': [''],
      'item': [],
      'quantity': ['', [Validators.required, CustomValidators.OnlyNumericValidate]],
      'rate': ['', [Validators.required, CustomValidators.decimalValidate]],
      'amount': ['', [Validators.required, CustomValidators.decimalValidate]],
      'packageItems': this.fb.array([])
    });
  }

  ngOnInit() {
    this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
    this.getParentCategories();
  }
  setItemsPerPage() {
    this.itemsPerPage = this.ddlitemsPerPage;
    this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
  }
  onEnter(value: string) {
    this.getAllPackage(this.itemsPerPage, this.pageIndex, value);
  }
  getPage(page: number) {
    this.pageIndex = page;
    this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
  }
  getAllPackage(itemsPerPage: number, pageIndex: number, searchkey: any) {
    this.packageSetupService.getAllPackage(itemsPerPage, pageIndex, searchkey,
      this.sortCol, this.sortDir).subscribe(
        employee => {
          this.packageSetup = employee['data'];
          this.totalItems = employee['total'];
          this.last_page = employee['last_page'];
        },
        err => { }
      );
  }
  onParentCategoryChange(parent) {
    if (parent !== '0') {
      this.getChildCategories(parent);
    } else {
      this.childCategories.length = 0;
    }
  }

  getParentCategories() {
    this._categoryService.getAllCategories(0).subscribe(
      data => {
        this.parentCategories = data;
      },
      err => { }
    );
  }
  getChildCategories(parentId: number) {
    this._categoryService.getAllCategories(parentId).subscribe(
      data => {
        this.childCategories = data;
      },
      err => { }
    );
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
  itemNameFormatter = (data: any) => {
    const html = `
         <span style='width:13%; display: inline-block'>${data.itemName}</span>
         `;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }
  searchItemSelected(item) {
    console.log(item);
    if (typeof (item) !== 'string') {
      // console.log(item);
      this.getChildCategories(item.category.parent_category);
      //  this.searchItemSelected = item;
      this.packageSetupForm.patchValue({
        'parentCategory': item.category.parent_category,
        'category': item.category.id,
        'item': item,
        'rate': item.salePrice,
      });
      if (this.formEditMode) {
        this.packageSetupForm.patchValue({
          'itemId': item.id
        });
      }

    }
    this.quantityChange();
  }
  getItemList(): FormArray {
    return <FormArray>this.packageSetupForm.controls['packageItems'];
  }
  addArrayList() {
    this.packageSetupForm.get('packageName').markAsDirty();
    this.packageSetupForm.get('validFor').markAsDirty();
    this.packageSetupForm.get('quantity').markAsDirty();
    this.packageSetupForm.get('rate').markAsDirty();
    this.packageSetupForm.get('amount').markAsDirty();
    if (this.packageSetupForm.valid) {
      const ingredient = this.packageSetupForm.get('item').value;
      if (typeof (ingredient) !== 'string') {
        // console.log(this.packageSetupForm.value);
        if (this.serviceList.length !== 0) {
          const duplicate = this.serviceList.filter(item => item.barcode === ingredient.barcode);
          if (duplicate.length !== 0) {
            const index = this.serviceList.findIndex(x => x.barcode === duplicate[0].barcode);
            // console.log(this.serviceRate);
            // console.log((this.serviceList[index]['stock']));
            // this.serviceRate = this.serviceRate;
            const quantity = this.packageSetupForm.get('quantity').value;
            const rate = this.packageSetupForm.get('rate').value;
            const amount = this.packageSetupForm.get('amount').value;
            this.itemIngredients = this.getItemList();

            // console.log(this.employeeForm.get('employee_service_comm'));
            this.packageSetupForm.get(['packageItems', index, 'quantity']).setValue(quantity);
            this.packageSetupForm.get(['packageItems', index, 'rate']).setValue(rate);
            this.packageSetupForm.get(['packageItems', index, 'amount']).setValue(amount);
          } else {
            ingredient['quantity'] = this.packageSetupForm.get('quantity').value;
            ingredient['rate'] = this.packageSetupForm.get('rate').value;
            ingredient['amount'] = this.packageSetupForm.get('amount').value;
            //  ingredient['deleted'] = false;
            this.serviceList.push(ingredient);
            this.itemIngredients = this.getItemList();
            this.itemIngredients.push(this.addToItemPackageList(ingredient));
          }
        } else {
          ingredient['quantity'] = this.packageSetupForm.get('quantity').value;
          ingredient['rate'] = this.packageSetupForm.get('rate').value;
          ingredient['amount'] = this.packageSetupForm.get('amount').value;
          // ingredient['deleted'] = false;
          //  console.log(ingredient['stock']);
          this.serviceList.push(ingredient);
          this.itemIngredients = this.getItemList();
          this.itemIngredients.push(this.addToItemPackageList(ingredient));
        }
        this.totalamount();
        this.searchbox = '';
        this.emptyAll();
        // console.log(this.serviceRate);
        // console.log(this.searchbox);
      }
      //  console.log(this.employeeForm.get('packageItems').value);
    }
  }
  emptyAll() {
    this.packageSetupForm.get('rate').reset();
    this.packageSetupForm.get('quantity').reset();
    this.packageSetupForm.get('amount').reset();
    // this.packageSetupForm.get('parentCategory').reset();
    // this.packageSetupForm.get('category').reset();
    this.itemSearch = '';
  }
  addToItemPackageList(item: any): FormGroup {
    // console.log(item);
    return this.fb.group({
      id: new FormControl(''),
      packageId: new FormControl(''),
      itemObj: new FormControl(item),
      itemId: new FormControl(item.id),
      quantity: new FormControl(item.quantity),
      rate: new FormControl(item.rate),
      amount: new FormControl(item.amount),
      deleted: new FormControl(false)
    });
  }
  totalamount() {
    let totalCost = 0;
    this.packageSetupForm.get('totalCost').setValue(0);
    for (let j = 0; j <= this.getItemList().length - 1; j++) {
      if (this.getItemList().at(j).get('deleted').value === false) {
        const amount = this.getItemList().at(j).get('amount').value;
        totalCost = +totalCost + +amount;
        //  console.log(totalCost);
      }
    }
    this.packageSetupForm.get('totalCost').setValue(totalCost);
  }
  removeService(i: number) {
    this.serviceList.splice(i, 1);
    if (this.getItemList().at(i).get('id').value !== '') {
      this.getItemList().at(i).get('deleted').setValue(true);
    } else {
      this.getItemList().removeAt(i);
    }
    this.totalamount();
    // this.getItemIngredientsList().removeAt(i);
  }
  editService(j: number) {
    const item = this.getItemList().at(j).get('itemObj').value;
    // console.log(item);
    if (typeof (item) !== 'string') {
      // console.log(item);
      this.getChildCategories(item.category.parent_category);
      //  this.searchItemSelected = item;
      this.packageSetupForm.patchValue({
        'parentCategory': item.category.parent_category,
        'category': item.category.id,
        'item': item,
        'rate': this.getItemList().at(j).get('rate').value,
        'quantity': this.getItemList().at(j).get('quantity').value,
        'amount': this.getItemList().at(j).get('amount').value,
      });
      if (this.formEditMode) {
        this.packageSetupForm.patchValue({
          'itemId': item.id
        });
      }

    }
  }

  quantityChange() {
    const quant = this.packageSetupForm.get('quantity').value;
    // console.log(quant);
    const rate = this.packageSetupForm.get('rate').value;
    const cost = (quant * rate);
    // console.log(cost);
    this.packageSetupForm.get('amount').setValue(cost);
  }

  onSubmit() {
    const lengthOfPackageService = this.packageSetupForm.get('packageItems').value;
    if (lengthOfPackageService.length !== 0) {
      if (!this.formEditMode) {
        this.packageSetupService.addPackageSetup(this.packageSetupForm.value).subscribe(
          res => {
            // this.spinner = false;
            if (res['status'] === 'success') {
              this.popToast('Package saved successfully', '');
              this.resetForm();
              this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
            } else {
              this.duplicateErrors(res);
            }
          },
          err => {
            // this.spinner = false;
            this.popToast('Unable to save package', '50');
            // this.resetForm();
          }
        );
      } else {
        const packageId = this.packageSetupForm.get('id').value;
        // this.spinner = true;
        this.packageSetupService.updatePackage(this.packageSetupForm.value, packageId).subscribe(
          res => {
            // this.spinner = false;
            if (res['status'] === 'success') {
              this.formEditMode = false;
              this.popToast('Package Updated Successfully!!', '');
              this.resetForm();
              this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
            } else {
              this.duplicateErrors(res);
            }
          },
          err => {
            //  this.spinner = false;
            this.popToast('Unable to update package!!', '50');
            // this.resetForm();
          }
        );
      }
    } else {
      this.popToast('Package should have one Item/Service', '51');
    }
  }
  duplicateErrors(res: any) {
    let html = '<div>';
    // this.popToast(res.errors['mobile_no'], '51');
    if (res.errors['packageName']) {
      this.packageSetupForm.controls['packageName'].setErrors({
        'required': true
      });
      html += '<p style="color: red;">' + res.errors['packageName'] + '</p>';
    }
    if (res.errors['validFor']) {
      this.packageSetupForm.controls['validFor'].setErrors({
        'required': true
      });
      html += '<p style="color: red;">' + res.errors['validFor'] + '</p>';
    }
    html += '</div>';
    this.popToast(html, '51');
  }
  resetForm() {
    this.packageSetupForm.reset();
    this.show = false;
    this.searchbox = ' ';
    this.formEditMode = false;
    // this.getNextRecordIdOfTable();
    this.removeAllItemServices();
    this.resetIngredients();
    this.serviceList = [];
  }
  reset() {
    this.packageSetupForm.reset();
    this.removeAllItemServices();
    this.resetIngredients();
    this.serviceList = [];
  }
  removeAllItemServices() {
    const itemIngredients = this.getItemList();
    for (let i = itemIngredients.controls.length - 1; i >= 0; i--) {
      itemIngredients.removeAt(i);
    }
  }
  resetIngredients() {
    const items = this.packageSetupForm.get('packageItems') as FormArray;
    for (let i = items.controls.length - 1; i >= 0; i--) {
      items.removeAt(i);
    }
  }
  getPackageToEdit(id: number) {
    this.show = true;
    this.resetIngredients();
    this.packageSetupService.getPackageById(id).subscribe(
      item => {
        this.formEditMode = true;
        //  console.log(item);
        // this.nextRecordId = item.id;
        this.setFormData(item);
        this.itemIngredients = this.getItemList();
        if (item['package_services'] !== null) {
          item['package_services'].forEach(ing => {
            this.itemIngredients.push(
              this.fb.group({
                id: new FormControl(ing.id),
                packageId: new FormControl(ing.packageId),
                itemObj: new FormControl(ing.package_service_item),
                itemId: new FormControl(ing.itemId),
                quantity: new FormControl(ing.quantity),
                rate: new FormControl(ing.rate),
                amount: new FormControl(ing.amount),
                deleted: new FormControl(false),
              })
            );
            this.serviceList.push(ing.package_service_item);
          });
          //  console.log(this.serviceList);
        }
        // console.log(this.itemForm.get('item_ingredients').value);
      },
      err => { }
    );
  }
  setFormData(packages: PackageSetup) {
    this.packageSetupForm.get('id').setValue(packages.id);
    this.packageSetupForm.get('packageName').setValue(packages.packageName);
    this.packageSetupForm.get('validFor').setValue(packages.validFor);
    this.packageSetupForm.get('packageCommission').setValue(packages.packageCommission);
    this.packageSetupForm.get('totalCost').setValue(packages.totalCost);
  }
  deletePackage(id: string) {
    this.packageSetupService.deletePackage(id).subscribe(res => {
      if (res['status'] === 'warning') {
        this.popToast(res['message'], '51');
      } else if (res['status'] === 'success') {
        this.popToast('Package deleted successfully !!', '');
        this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
      }
      // this.popToast('Package deleted successfully !!', '');
      // this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
    }, err => {
      this.popToast('Unable to delete package', '50');
      this.getAllPackage(this.itemsPerPage, this.pageIndex, '');
    });
  }
}
