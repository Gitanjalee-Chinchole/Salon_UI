import {
  Component, OnInit, Inject, ViewChild, ElementRef, Renderer,
  AfterViewInit, ViewChildren, ViewContainerRef, Output, EventEmitter
} from '@angular/core';
import { CategoryService } from '../category/category.service';
import { Category } from '../category/category';
import { UnitService } from '../unit/unit.service';
import { Unit } from '../unit/unit';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ItemService } from './item.service';
import { ToasterService, ToasterConfig, BodyOutputType } from 'angular2-toaster';
import { CommonService } from '../shared/common.service';
import { Item } from './item';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Popup } from 'ng2-opd-popup';
import { Headers } from '@angular/http';
import { FormArray } from '@angular/forms/src/model';
import { StarterHeaderComponent } from '../layout/starter-header/starter-header.component';
import { StarterComponent } from '../starter/starter.component';
import { EventEmiterService } from '../shared/event-emitter.service';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { isEmpty } from 'rxjs/operator/isEmpty';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { CustomValidators } from '../shared/customevalidators';
import { ActivatedRoute } from '@angular/router';
import { slideIn } from '../shared/animation';
import { WindowRef } from '../shared/windowRef';
import { environment } from '../../environments/environment';

const URL = 'https://salonapi.sagarmutha.com/api/importItems';
declare var require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');
declare var jquery: any;
declare var $: any;
@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css'],
  animations: [slideIn]
})
export class ItemComponent implements OnInit, AfterViewInit {
  dateTo = new Date();
  spinner = true;
  api_url = environment.api_url;
  pageIndex = 1;
  show = false;
  ddlitemsPerPage: any;
  itemsPerPage = 10;
  totalItems = 0;
  itembarcode = '';
  last_page: number;
  parentCategories: Category[] = [];
  childCategories: Category[] = [];
  itemIngredients: any;
  formDivToggle = false;
  units: Unit[] = [];
  searchbox = '';
  items: Item[] = [];
  itemForm: FormGroup;
  serviceQuantity = 0;
  nextRecordId: number;
  public fileString: any;
  public jsonvalue;
  fileData: any;
  imageSrc = './assets/img/product_img.jpg';

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('importItemsfileInput') importItemsfileInput: ElementRef;

  starterComponent: any;
  selectedService: any;
  serviceList = [];
  duplicateItems: any;
  searchKey: any;
  sortCol: string;
  sortDir: string;
  queryParams: any;

  public config1: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-right',
    showCloseButton: true,
    tapToDismiss: false,
    animation: 'fade'
  });
  duplicateItemsForm: FormGroup;
  formEditMode = false;
  dpitems: any;
  sub: Subscription;
  bcFormat = ' null | CODE128';
  a2eOptions = { format: 'HH:mm' };
  private uploaderOptions: FileUploaderOptions = {};
  uploader: FileUploader = new FileUploader({ url: URL });
  constructor(private window: WindowRef,
    private fb: FormBuilder, private _categoryService: CategoryService,
    private _unitService: UnitService,
    private _itemService: ItemService,
    private _toasterService: ToasterService,
    private _commonService: CommonService,
    private renderer: Renderer,
    private popup: Popup,
    private _eventEmiter: EventEmiterService,
    private _sanitizer: DomSanitizer,
    private routeService: ActivatedRoute) {

    this.ddlitemsPerPage = this.itemsPerPage;
    this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getAllItems(this.itemsPerPage, this.pageIndex, '');
      });
    this.sortDir = 'asc';
    this.sortCol = 'id';

    this.duplicateItemsForm = fb.group({
      items: this.fb.array([])
    });

    this.itemForm = fb.group({
      id: new FormControl(''),
      productCode: new FormControl(''),
      serialNumber: new FormControl(''),
      parentCategory: new FormControl(0),
      category: new FormControl('', Validators.required),
      barcode: new FormControl('', [Validators.required, CustomValidators.minLengthValidate]),
      itemName: new FormControl('', [Validators.required, CustomValidators.nospaceValidator]),
      itemType: new FormControl('', Validators.required),
      itemNameArabic: new FormControl(''),
      costPrice: new FormControl('', [CustomValidators.decimalValidate]),
      salePrice: new FormControl('', [Validators.required, CustomValidators.decimalValidate]),
      description: new FormControl(''),
      unit: new FormControl('1', Validators.required),
      stock: new FormControl({ value: 0, disabled: true }),
      min: new FormControl('', CustomValidators.onlyNumericValidateifnotempty),
      max: new FormControl('', CustomValidators.onlyNumericValidateifnotempty),
      stylistCommRate: new FormControl('', CustomValidators.decimalValidate),
      serviceTime: new FormControl('', Validators.maxLength(5)),
      expiry_date: new FormControl('2017-03-01'),
      image: new FormControl(''),
      createt_at: new FormControl(''),
      updated_at: new FormControl(''),
      item_ingredients: this.fb.array([])
    });
    this.uploader.onAfterAddingFile = (fileItem) => {
      this.fileData.push(fileItem);
    };
    this.popup.options = {
      header: 'Duplicate Items',
      color: '#dd4b39', // red, blue....
      widthProsentage: 80, // The with of the popou measured by browser width
      animationDuration: 0.5, // in seconds, 0 = no animation
      showButtons: false, // You can hide this in case you want to use custom buttons
      confirmBtnContent: 'OK', // The text on your confirm button
      cancleBtnContent: 'Cancel', // the text on your cancel button
      confirmBtnClass: 'btn btn-default', // your class for styling the confirm button
      cancleBtnClass: 'btn btn-default', // you class for styling the cancel button
      animation: 'fadeInUp' // 'fadeInLeft', 'fadeInRight', 'fadeInUp', 'bounceIn','bounceInDown'
    };
  }

  ngOnInit() {
    // this.itembarcode = this.itemForm.get('barcode').value;
    this.getAllItems(this.itemsPerPage, this.pageIndex, '');
    this.getParentCategories();
    this.getallUnits();
    this.getNextRecordIdOfTable();
    // setTimeout(() => {
    //   this.spinner = false;
    // }, 4000);
  }

  ngAfterViewInit(): void {
    console.log('item called');
    this._eventEmiter.emitChange('Collapse in Item Master');
  }

  autocompleListFormatter = (data: any) => {
    const html = `<span style='width:13%; display: inline-block'>${data.itemName}</span>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }
  getItemIngredientsList(): FormArray {
    return <FormArray>this.itemForm.controls['item_ingredients'];
  }
  searchIngredients = (keyword: any): Observable<any[]> => {
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

  ingredientSelected(ingredient) {

    if (typeof (ingredient) !== 'string') {
      if (this.serviceList.length !== 0) {
        const duplicate = this.serviceList.filter(item => item.barcode === ingredient.barcode);
        if (duplicate.length !== 0) {
          const index = this.serviceList.findIndex(x => x.barcode === duplicate[0].barcode);
          //   console.log(typeof (this.serviceList[index]['stock']));
          this.serviceList[index]['stock'] = this.serviceQuantity + Number(this.serviceList[index]['stock']);
          this.itemIngredients = this.getItemIngredientsList();
          this.itemForm.get(['item_ingredients', index, 'quantity']).setValue(this.serviceList[index]['stock']);
        } else {
          ingredient['stock'] = this.serviceQuantity;
          //  ingredient['deleted'] = false;
          this.serviceList.push(ingredient);
          this.itemIngredients = this.getItemIngredientsList();
          this.itemIngredients.push(this.addToItemIngredientsList(ingredient));
        }
      } else {
        ingredient['stock'] = this.serviceQuantity;
        // ingredient['deleted'] = false;
        //  console.log(ingredient['stock']);
        this.serviceList.push(ingredient);
        this.itemIngredients = this.getItemIngredientsList();
        this.itemIngredients.push(this.addToItemIngredientsList(ingredient));
      }
      this.searchbox = ' ';
      //  console.log(this.itemForm.get('item_ingredients').value);
    }
    console.log(this.itemForm.get('item_ingredients').value);
  }

  removeService(i: number) {
    this.serviceList.splice(i, 1);
    if (this.getItemIngredientsList().at(i).get('id').value !== '') {
      this.getItemIngredientsList().at(i).get('deleted').setValue(true);
    } else {
      this.getItemIngredientsList().removeAt(i);
    }
    // this.getItemIngredientsList().removeAt(i);
  }
  getAllItems(itemsPerPage: number, pageIndex: number, searchkey: any) {
    this._itemService.getAllItems(itemsPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
      items => {
        this.spinner = false;
        this.items = items['data'];
        this.totalItems = items['total'];
        this.last_page = items['last_page'];
      },
      err => { }
    );
  }
  onEnter(value: string) {
    this.getAllItems(this.itemsPerPage, this.pageIndex, value);
  }
  getPage(page: number) {
    this.pageIndex = page;
    this.getAllItems(this.itemsPerPage, this.pageIndex, '');
  }

  setItemsPerPage() {
    this.itemsPerPage = this.ddlitemsPerPage;
    this.getAllItems(this.itemsPerPage, this.pageIndex, '');
  }

  exportToPDF() {
    const columns = [
      { title: 'Item No', dataKey: 0 },
      { title: 'Category', dataKey: 1 },
      { title: 'Item/Product', dataKey: 2 },
      { title: 'C.P.', dataKey: 3 },
      { title: 'S.P.', dataKey: 4 },
      { title: 'Unit', dataKey: 5 },
      { title: 'Stock', dataKey: 6 },
      { title: 'Min', dataKey: 7 },
      { title: 'Max', dataKey: 8 }
    ];
    const rows = [];
    this.items.forEach(item => {
      rows.push({
        0: item.id, 1: item.category == null ? ' ' : item.category.categorie,
        2: item.itemName, 3: item.costPrice, 4: item.salePrice,
        5: item.unit.unit, 6: item.stock, 7: item.min == null ? '' : item.min, 8: item.max == null ? '' : item.max
      });
    });
    // Only pt supported (not mm or in)
    const doc = new jsPDF('p', 'pt');
    doc.rect(15, 15, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 30, 'S');
    doc.autoTable(columns, rows, {
      theme: 'grid',
      drawHeaderCell: function (cell, data) {
        cell.styles.textColor = [255, 255, 255];
      },
      styles: {
        overflow: 'linebreak',
      },
      pageBreak: 'auto',
      columnStyles: {
        id: { fillColor: [255, 0, 0] },
        2: { columnWidth: 'auto' }
      },
      addPageContent: function (data) {
        doc.text('Items ', doc.internal.pageSize.width / 2, 35, 'center');
      }
    });
    doc.save('Items.pdf');
  }

  readExcelFile($event): void {
    this.readThis($event.target);
  }

  readThis(inputValue: any): void {
    const fileList: FileList = inputValue.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.append('import_items', file, file.name);
      this.fileData = formData;
    }
  }
  exportToExcel() {
    this._itemService.exportInternalOrder().subscribe(
      data => {
        console.log('working');
      },
      err => { }
    );
  }
  uploadItems() {
    this.spinner = true;
    //  console.log(this.fileData);
    this._itemService.uploadItems(this.fileData).subscribe(res => {
      if (res['status'] === 'success') {
        this._toasterService.pop({
          type: 'success', title: 'Item Import',
          body: 'Item imported Successfully!!'
        });
        this.spinner = false;
        this.getAllItems(this.itemsPerPage, this.pageIndex, '');
      } else {
        this._toasterService.pop({
          type: 'warning', title: 'Item Import',
          body: `Duplicate Items!!`,
        });
        this.duplicateItems = res['duplicate'];
        this.spinner = false;
        this.popup.show();
        // create a popup form woth form array
        this.dpitems = this.duplicateItemsForm.get('items') as FormArray;
        res['duplicate'].forEach(item => {
          this.dpitems.push(this.createItem(item));
        });
      }
    },
      err => {
        this._toasterService.pop({
          type: 'success', title: 'Item Import',
          body: 'error importing Items!!'
        });
        this.spinner = false;
      });
  }

  getItemToEdit(id: number) {
    this.show = true;
    this.resetIngredients();
    this._itemService.getItemById(id).subscribe(
      item => {
        this.formEditMode = true;
        this.formDivToggle = true;
        this.nextRecordId = item.id;
        this.getChildCategories(item.category.parent_category);
        this.setFormData(item);
        this.itemIngredients = this.getItemIngredientsList();
        if (item['ingredients'] !== null) {
          item['ingredients'].forEach(ing => {
            this.itemIngredients.push(
              this.fb.group({
                id: new FormControl(ing.id),
                item: new FormControl(ing.item),
                itemObj: new FormControl(ing.ingredient_item),
                ingredient: new FormControl(ing.ingredient),
                quantity: new FormControl(ing.quantity, Validators.required),
                deleted: new FormControl(false),
              })
            );
            this.serviceList.push(ing.ingredient_item);
          });
          //  console.log(this.serviceList);
        }
        console.log(this.itemForm.get('item_ingredients'));
      },
      err => { }
    );
  }

  setFormData(item: Item) {
    this.itemForm.get('id').setValue(item.id);
    this.itemForm.get('parentCategory').setValue(item.category.parent_category);
    this.itemForm.get('category').setValue(item.category.id);
    if (item.image != null) {
      this.imageSrc = this.api_url + item.image;
    }
    this.itemForm.get('image').setValue(item.image);
    this.itemForm.get('itemType').setValue(item.itemType);
    this.itemForm.get('itemName').setValue(item.itemName);
    this.itemForm.get('barcode').setValue(item.barcode);
    this.itembarcode = item.barcode;
    this.itemForm.get('productCode').setValue(item.productCode);
    this.itemForm.get('serialNumber').setValue(item.serialNumber);
    this.itemForm.get('salePrice').setValue(item.salePrice);
    this.itemForm.get('costPrice').setValue(item.costPrice);
    this.itemForm.get('description').setValue(item.description);
    this.itemForm.get('unit').setValue(item.unit.id);
    this.itemForm.get('min').setValue(item.min);
    this.itemForm.get('max').setValue(item.max);
    this.itemForm.get('stock').setValue(item.stock);
    this.itemForm.get('stock').disable();
    this.itemForm.get('stylistCommRate').setValue(item.stylistCommRate);
    this.itemForm.get('serviceTime').setValue(
      item.serviceTime !== null ? item.serviceTime.substring(0, 5) : item.serviceTime);
  }

  addToItemIngredientsList(item: any): FormGroup {
    return this.fb.group({
      id: new FormControl(''),
      item: new FormControl(''),
      itemObj: new FormControl(item),
      ingredient: new FormControl(item.id),
      quantity: new FormControl(item.stock, Validators.required),
      deleted: new FormControl(false)
    });
  }

  private minLengthValidation(control: FormControl) {
    if (control.value && control.value.length === 0) {
      return { required: true };
    } else if (control.value && control.value.trim().length === 0) {
      control.setValue('');
      return { nospace: true };
    } else if (control.value && control.value.length < 1) {
      return { minlength: true };
    } else {
      return null;
    }
  }

  createItem(item: any): FormGroup {
    return this.fb.group({
      id: new FormControl(item.id),
      itemName: new FormControl(item.itemName, Validators.required),
      barcode: new FormControl(item.barcode, Validators.required),
      category: new FormControl(item.category, Validators.required),
      itemType: new FormControl(item.itemType),
      costPrice: new FormControl(item.costPrice),
      quantity: new FormControl(item.qty),
      salePrice: new FormControl(item.salePrice, Validators.required),
      unit: new FormControl(item.unit, Validators.required),
      createt_at: new FormControl(''),
      updated_at: new FormControl(''),
      type: new FormControl(item.type)
    });
  }

  uploadDuplicateItems() {
    if (this.duplicateItemsForm.get('items').valid) {
      const data = this.duplicateItemsForm.get('items').value;
      this._itemService.saveDuplicateItems(data).subscribe(
        res => {
          if (res['status'] === 'success') {
            this._toasterService.pop({
              type: 'success', title: 'Item Import',
              body: 'Item imported Successfully!!'
            });
            this.getAllItems(this.itemsPerPage, this.pageIndex, '');
          } else {
            this.resetDuplicateItemForm();
            this._toasterService.pop({
              type: 'warning', title: 'Item Import',
              body: 'Item duplicate!!'
            });
            // this.duplicateItems = res['duplicate'];
            //  this.popup.show();
            // create a popup form woth form array

            res['duplicate'].forEach(item => {
              this.dpitems.push(this.createItem(item));
            });

            //  console.log(this.duplicateItemsForm.value);
          }
        },
        err => { }
      );
    }
  }

  deleteDuplicateItem(i: number) {
    this.dpitems = this.duplicateItemsForm.get('items') as FormArray;
    this.dpitems.removeAt(i);
  }

  resetIngredients() {
    const items = this.itemForm.get('item_ingredients') as FormArray;
    for (let i = items.controls.length - 1; i >= 0; i--) {
      items.removeAt(i);
    }
  }

  resetDuplicateItemForm() {
    this.dpitems = this.duplicateItemsForm.get('items') as FormArray;
    for (let i = this.dpitems.controls.length - 1; i >= 0; i--) {
      this.dpitems.removeAt(i);
    }
  }
  cancelPopup() {
    this.resetDuplicateItemForm();
    this.popup.hide();
  }
  openImportItemsDialog() {
    const event = new MouseEvent('click', { bubbles: true });
    this.renderer.invokeElementMethod(
      this.importItemsfileInput.nativeElement, 'dispatchEvent', [event]);
  }
  openFileUploadDialig() {
    const event = new MouseEvent('click', { bubbles: true });
    this.renderer.invokeElementMethod(
      this.fileInput.nativeElement, 'dispatchEvent', [event]);
  }

  fileUpload(event) {

    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.append('photo', file, file.name);
      this._itemService.itemImageUpload(formData).subscribe(
        data => {
          this.imageSrc = this.api_url + data;
          this.itemForm.get('image').setValue(data);
          console.log('uploaded');
        },
        err => { console.log('upload error'); }
      );
    }
  }
  getNextRecordIdOfTable() {
    this._commonService.getLastNextRecordId('items').subscribe(
      res => {
        this.nextRecordId = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  onChange(deviceValue) {
    if (deviceValue !== '0') {
      this.getChildCategories(deviceValue);
    } else {
      this.childCategories.length = 0;
    }
  }

  getallUnits() {
    this._unitService.getUnit().subscribe(
      units => {
        this.units = units;
        console.log(units);
      },
      err => {
        console.log(err);
      }
    );
  }

  getParentCategories() {
    this._categoryService.getAllCategories(0).subscribe(
      data => {
        this.parentCategories = data;
      },
      err => {
        console.log(err);
      }
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

  updateItemBarcode() {
    (this.itemForm.get('barcode').value.length === 0) ? this.itembarcode = '' : this.itembarcode = this.itemForm.get('barcode').value;
  }

  onSubmit() {
    this.itemForm.get('category').markAsDirty();
    this.itemForm.get('itemName').markAsDirty();
    this.itemForm.get('itemType').markAsDirty();
    this.itemForm.get('barcode').markAsDirty();
    this.itemForm.get('salePrice').markAsDirty();
    this.itemForm.get('unit').markAsDirty();
    if (this.itemForm.valid) {
      this.itemForm.get('stock').enable();
      //  console.log(this.itemForm.value);
      if (!this.formEditMode) {
        this.spinner = true;
        this._itemService.addItem(this.itemForm.value).subscribe(
          res => {
            this.spinner = false;
            if (res['status'] === 'success') {
              this._toasterService.pop({ type: 'success', title: 'Item Master', body: 'Item Added Successfully!!', timeout: 1000 });
              this.resetForm();
              this.show = false;
              this.getAllItems(this.itemsPerPage, this.pageIndex, '');
            } else {
              this._toasterService.pop({ type: 'warning', title: 'Item Master', body: res['errors']['barcode'], timeout: 1000 });
            }
          },
          err => {
            this.spinner = false;
            this._toasterService.pop({ type: 'error', title: 'Item Master', body: 'unable to add!!', timeout: 1000 });
            // this.resetForm();
          }
        );
      } else {
        const itemId = this.itemForm.get('id').value;
        this.spinner = true;
        this._itemService.updateItem(this.itemForm.value, itemId).subscribe(
          res => {
            this.spinner = false;
            if (res['status'] === 'success') {
              this.formEditMode = false;
              this.show = false;
              this._toasterService.pop({ type: 'success', title: 'Item Master', body: 'Item Updated Successfully!!', timeout: 1000 });
              this.resetForm();
              this.getAllItems(this.itemsPerPage, this.pageIndex, '');
            } else {
              let html = '<div>';
              if (res['errors']['serviceTime']) {
                html += '<p style="color: red;">' + res['errors']['serviceTime'] + '</p>';
              }
              if (res['errors']['barcode']) {
                const errorStr = res['errors']['barcode'];
                let errors = new Array();
                errors = errorStr.toString().split(',');

                for (let x = 0; x < errors.length; x++) {
                  html += '<p style="color: red;">' + errors[x] + '</p>';
                }
              }
              html += '</div>';
              this._toasterService.pop({ type: 'warning', title: 'Item Master', body: html, bodyOutputType: BodyOutputType.TrustedHtml });
            }
          },
          err => {
            this.spinner = false;
            this._toasterService.pop({ type: 'error', title: 'Item Master', body: 'unable to update!!', timeout: 1000 });
            // this.resetForm();
          }
        );
      }

    }


  }

  resetForm() {
    //   this.show = false;
    this.removeAllItemIngredients();
    this.searchbox = ' ';
    this.formEditMode = false;
    this.serviceQuantity = null;
    this.resetIngredients();
    this.itemForm.reset();
    this.itemForm.get('stock').setValue(0);
    this.itemForm.get('stock').disable();
    this.imageSrc = '../assets/img/product_img.jpg';
    this.getNextRecordIdOfTable();
    this.itembarcode = '';
    this.dateTo = new Date();
    this.serviceList = [];
  }
  removeAllItemIngredients() {
    const itemIngredients = this.getItemIngredientsList();
    for (let i = itemIngredients.controls.length - 1; i >= 0; i--) {
      itemIngredients.removeAt(i);
    }
  }
  dateToChange(date) {
    this.dateTo = date;
  }
  deleteItem(id: string) {
    this._itemService.deleteItem(id).subscribe(res => {
      if (res['status'] === 'warning') {
        this._toasterService.pop({ type: 'warning', title: 'Item Master', body: res['message'], timeout: 1500 });
      } else if (res['status'] === 'success') {
        this._toasterService.pop({ type: 'success', title: 'Item Master', body: 'Item Deleted Successfully!!', timeout: 1000 });
        this.getAllItems(this.itemsPerPage, this.pageIndex, '');
      }
      // else {
      //   this.popToast(res['error'], '50');
      // }

      // this.getAllItems(this.itemsPerPage, this.pageIndex, '');
    }, err => {
      // this.popToast('Unable to delete employee', '50');
      this.getAllItems(this.itemsPerPage, this.pageIndex, '');
    });
  }

}
