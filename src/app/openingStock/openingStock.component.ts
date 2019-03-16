import { Component, Renderer, Inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { IMyDpOptions } from 'mydatepicker';
import { Subscription, Observable } from 'rxjs/Rx';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { OpeningStock } from './openingStock';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Unit } from '../unit/unit';
import { UnitService } from '../unit/unit.service';
import { ItemService } from '../item/item.service';
import { CommonService } from '../shared/common.service';
import { Popup } from 'ng2-opd-popup';
import { EventEmiterService } from '../shared/event-emitter.service';
import { DomSanitizer } from '@angular/platform-browser';
import { OpeningStockService } from './openingStock.service';
import * as moment from 'moment';
import { CategoryService } from '../category/category.service';
import { Category } from '../category/category';
import { CustomValidators } from '../shared/customevalidators';
import { slideIn } from '../shared/animation';
import { ActivatedRoute, Router } from '@angular/router';
import { WindowRef } from '../shared/windowRef';

declare var require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');
declare var jquery: any;
declare var $: any;

@Component({
    selector: 'app-anc',
    templateUrl: './openingStock.component.html',
    styleUrls: ['./openingStock.component.css'],
    animations: [slideIn]
})
export class OpeningStockComponent implements OnInit, AfterViewInit {
    spinner = true;
    model: any;
    fileData: any;
    pageIndex = 1;
    show = false;
    ddlitemsPerPage: any;
    itemsPerPage = 10;
    totalItems = 0;
    last_page: number;
    itemIngredients: any;
    formDivToggle = false;
    parentCategories: Category[] = [];
    childCategories: Category[] = [];
    units: Unit[] = [];
    currendate = new Date();
    todayDate: {};

    searchbox = '';
    opening_stocks: OpeningStock[] = [];
    itemForm: FormGroup;
    nextRecordId: number;
    starterComponent: any;
    selectedService: any;
    itemSearch: any;
    barcodeSearch: any;
    selectedSearchItem: any;
    public config1: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-top-right',
        showCloseButton: true,
        tapToDismiss: false,
        animation: 'fade'
    });
    formEditMode = false;
    dpitems: any;
    sub: Subscription;
    sortCol: string;
    sortDir: string;
    tempArr: number[] = [1, 2, 3];
    title = 'openingStock';
    public myDatePickerOptions: IMyDpOptions = {
        dateFormat: 'dd/mm/yyyy',
        height: '28px',
    };
    @ViewChild('importItemsfileInput') importItemsfileInput: ElementRef;
    constructor(private window: WindowRef,
        private fb: FormBuilder,
        private _openingStockService: OpeningStockService,
        private _unitService: UnitService,
        private _itemService: ItemService,
        private _toasterService: ToasterService,
        private _commonService: CommonService,
        private _categoryService: CategoryService,
        private renderer: Renderer,
        private popup: Popup,
        private _eventEmiter: EventEmiterService,
        private _sanitizer: DomSanitizer, private routeService: ActivatedRoute) {
        this.routeService.queryParams
            .filter(params => 'sort' in params)
            .map(params => params)
            .distinctUntilChanged()
            .subscribe(data => {
                this.sortCol = data['sort'];
                this.sortDir = data['dir'];
                this.getAllOpeningStocks(this.itemsPerPage, this.pageIndex, '');
            });
        this.sortDir = 'asc';
        this.sortCol = 'id';
        this.todayDate = {
            date: {
                year: this.currendate.getFullYear(),
                month: this.currendate.getMonth() + 1,
                day: this.currendate.getDate()
            }
        };
        this.ddlitemsPerPage = this.itemsPerPage;
        this.itemForm = fb.group({
            'id': [],
            'parentCategory': [''],
            'category': [''],
            'open_stock_date': [this.todayDate, Validators.required],
            'itemId': [],
            'item': [],
            'openingStock': ['', [Validators.required, CustomValidators.OnlyNumericValidate]],
            'unitId': ['', Validators.required],
            'unit': [],
            'openingItems': this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.getAllOpeningStocks(this.itemsPerPage, this.pageIndex, '');
        this.getParentCategories();
        this.getallUnits();
    }

    ngAfterViewInit(): void {
        this.sortDir = 'asc';
        this.sortCol = 'id';
        this._eventEmiter.emitChange('');
    }
    setItemsPerPage() {
        this.itemsPerPage = this.ddlitemsPerPage;
        this.getAllOpeningStocks(this.itemsPerPage, this.pageIndex, '');
    }
    onEnter(value: string) {
        this.getAllOpeningStocks(this.itemsPerPage, this.pageIndex, value);
    }
    searchByItemName = (keyword: any): Observable<any[]> => {
        if (keyword.length >= 2) {
            return this.search(keyword, 'itemName');
        } else {
            return Observable.of([]);
        }
    }

    searchByItemBarcode = (keyword: any): Observable<any[]> => {
        if (keyword.length >= 2) {
            return this.search(keyword, 'barcode');
        } else {
            return Observable.of([]);
        }
    }

    search(keyword: any, on: string): Observable<any[]> {
        return this._itemService.searchIngredients(keyword, 'Product', on).map(
            res => {
                const data = [];
                res.forEach(element => {
                    data.push(element);
                });
                return data;
            },
            err => { }
        );
    }

    itemNameFormatter = (data: any) => {
        const html = `
         <span style='width:13%; display: inline-block'>${data.itemName}</span>
         `;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }

    itemBarcodeFormatter = (data: any) => {
        const html = `
         <span style='width:13%; display: inline-block'>${data.barcode}</span>
         `;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }

    searchItemSelected(item) {
        console.log(item);
        if (typeof (item) !== 'string') {
            console.log(item);
            this.getChildCategories(item.category.parent_category);
            //  this.searchItemSelected = item;
            this.itemForm.patchValue({
                'parentCategory': item.category.parent_category,
                'category': item.category.id,
                'item': item,
                'unit': item.unit,
                'unitId': item.unit.id
            });
            if (this.formEditMode) {
                this.itemForm.patchValue({
                    'itemId': item.id
                });
            }

        }

    }

    getAllOpeningStocks(itemsPerPage: number, pageIndex: number, searchkey: any) {
        this.formEditMode = false;
        this._openingStockService.getPaginateOpeningStock(itemsPerPage, pageIndex,
            searchkey, this.sortCol, this.sortDir).subscribe(opening_stocks => {
                this.opening_stocks = opening_stocks['data'];
                this.opening_stocks.forEach(opening_stock => {
                    const dateFormat = 'YYYY-DD-MM HH:mm:ss';
                    const testDateUtc = moment.utc(opening_stock.updated_at);
                    const localDate = testDateUtc.local();
                    opening_stock.updated_at = localDate;
                });
                this.totalItems = opening_stocks['total'];
                this.last_page = opening_stocks['last_page'];
            }, err => {
                console.log('error');
            });
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

    getallUnits() {
        this._unitService.getUnit().subscribe(
            units => {
                this.units = units;
            },
            err => { }
        );
    }
    getOpeningItemToEdit(id: number) {
        this._openingStockService.getOpeningItemById(id).subscribe(
            res => {
                this.formEditMode = true;
                this.show = true;
                this.itemSearch = res.item.itemName;
                const date = new Date(res.open_stock_date);
                this.getChildCategories(res.item.category.parent_category);
                this.itemForm.patchValue({
                    id: res.id,
                    parentCategory: res.item.category.parent_category,
                    category: res.item.category.id,
                    open_stock_date: {
                        date: {
                            year: date.getFullYear(),
                            month: date.getMonth() + 1,
                            day: date.getDate()
                        }
                    },
                    itemId: res.item.id,
                    openingStock: res.openingStock,
                    unitId: res.unitId,
                    unit: res.unit
                });
            },
            err => { }
        );
    }
    deleteOpeningStockItem(id: string) {
        this._openingStockService.deleteOpeningStockItem(id).subscribe(
            res => {
                if (res['status'] === 'success') {
                    this._toasterService.pop({
                        type: 'success', title: 'Opening Stock',
                        body: 'OpeningStock deleted successfully!!'
                    });
                    this.getAllOpeningStocks(this.itemsPerPage, this.pageIndex, '');
                } else {
                    this._toasterService.pop({
                        type: 'warning', title: 'Opening Stock',
                        body: 'Warning!!'
                    });
                }
            },
            err => {
                this._toasterService.pop({
                    type: 'error', title: 'Opening Stock',
                    body: 'Unable to delete opening stock!!'
                });
            }
        );
    }

    getItemList(): FormArray {
        return <FormArray>this.itemForm.controls['openingItems'];
    }
    onSubmit() {
        console.log(this.itemForm);
        this.itemForm.controls['open_stock_date'].markAsDirty();
        this.itemForm.controls['openingStock'].markAsDirty();
        this.itemForm.controls['unitId'].markAsDirty();
        if (this.itemForm.valid) {

            if (!this.formEditMode) {
                const items = this.getItemList();
                const item = this.itemForm.value;
                items.push(this.pushToList(item));
                // this.itemForm.reset();
            } else {
                console.log('edit mode');
                const formData = this.itemForm.value;
                if (formData.open_stock_date !== '' && formData.open_stock_date !== null) {
                    const openingStockDate = formData.open_stock_date.date;
                    formData.open_stock_date = moment(new Date(openingStockDate.year, openingStockDate.month - 1,
                        openingStockDate.day)).format('YYYY-MM-DD');
                    //   this.itemForm.get('open_stock_date').setValue(bdate);
                }
                const id = this.itemForm.get('id').value.toString();
                this._openingStockService.updateOpeningStockItem(formData, id).subscribe(
                    res => {
                        if (res['status'] === 'success') {
                            this._toasterService.pop({
                                type: 'success', title: 'Opening Stock',
                                body: 'OpeningStock updated successfully!!'
                            });
                            this.resetForm();
                            this.getAllOpeningStocks(this.itemsPerPage, this.pageIndex, '');
                            this.show = false;
                        } else {
                            if (res['status'] === 'success') {
                                this._toasterService.pop({
                                    type: 'warning', title: 'Opening Stock',
                                    body: 'Warning!!'
                                });
                            }
                        }
                    },
                    err => {
                        this._toasterService.pop({
                            type: 'error', title: 'Opening Stock',
                            body: 'Unable to update!!'
                        });
                    }
                );
            }
        }
    }
    pushToList(item: any): FormGroup {
        let bdate;
        //  console.log(item);
        if (item.open_stock_date !== '' && item.open_stock_date !== null) {
            const openingStockDate = item.open_stock_date.date;
            bdate = moment(new Date(openingStockDate.year, openingStockDate.month - 1,
                openingStockDate.day)).format('YYYY-MM-DD');
            //   this.itemForm.get('open_stock_date').setValue(bdate);
        }
        return this.fb.group({
            'id': [],
            'parentCategory': [item.parentCategory],
            'category': [item.category],
            'open_stock_date': [bdate],
            'itemId': [item.item.id],
            'item': [item.item],
            'openingStock': [item.openingStock],
            'unit': item.unit,
            'unitId': [item.unitId],
        });
    }
    getNextPageRecords(page: number) {
        this.pageIndex = page;
        this.getAllOpeningStocks(this.itemsPerPage, this.pageIndex, '');
    }
    removeItem(i: number) {
        const items = this.getItemList();
        items.removeAt(i);
    }
    resetopeningItems() {
        const items = this.getItemList();
        for (let i = items.controls.length - 1; i >= 0; i--) {
            items.removeAt(i);
        }
    }
    submit() {
        const openingItemsList = this.itemForm.get('openingItems').value;
        console.log(openingItemsList);
        this._openingStockService.addOpeningItems(openingItemsList).subscribe(
            res => {
                if (res['status'] === 'success') {
                    this._toasterService.pop({
                        type: 'success', title: 'Opening Stock',
                        body: 'Opening Stock saved successfully!!'
                    });
                    this.resetopeningItems();
                    this.resetForm();
                    this.getAllOpeningStocks(this.itemsPerPage, this.pageIndex, '');
                    this.show = false;
                }
            },
            err => {
                if (err['status'] === 'error') {
                    this._toasterService.pop({
                        type: 'error', title: 'Opening Stock',
                        body: 'Unable to save opening stock!!'
                    });
                }
                console.log('error');
            }
        );
    }
    openImportItemsDialog() {
        const event = new MouseEvent('click', { bubbles: true });
        this.renderer.invokeElementMethod(
            this.importItemsfileInput.nativeElement, 'dispatchEvent', [event]);
    }
    readExcelFile($event): void {
        this.readThis($event.target);
    }

    readThis(inputValue: any): void {
        const fileList: FileList = inputValue.files;
        if (fileList.length > 0) {
            const file: File = fileList[0];
            const formData: FormData = new FormData();
            formData.append('item_stock_import', file, file.name);
            this.fileData = formData;
        }
    }
    uploadItems() {
        this._openingStockService.uploadExcelOpeningItems(this.fileData).subscribe(
            res => {
                if (res['status'] === 'success') {
                    this._toasterService.pop({
                        type: 'success', title: 'Opening Stock',
                        body: res['msg']
                    });
                } else if (res['status'] === 'warning') {
                    this._toasterService.pop({
                        type: 'warning', title: 'Opening Stock',
                        body: res['msg']
                    });
                }
                this.getAllOpeningStocks(this.itemsPerPage, this.pageIndex, '');
            },
            err => {
                if (err['status'] === 'error') {
                    this._toasterService.pop({
                        type: 'error', title: 'Opening Stock',
                        body: 'Unable to save opening stock!!'
                    });
                }
            }
        );
    }
    resetForm() {
        this.itemForm.reset();
    }
}
