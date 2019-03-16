import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ToasterService, Toast, BodyOutputType, ToasterConfig } from 'angular2-toaster';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from './category.service';
import { Category } from './category';
import * as moment from 'moment';
import { saveAs as importedSaveAs } from 'file-saver';
declare var require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');
declare var jquery: any;
declare var $: any;
import { slideIn } from '../shared/animation';
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  animations: [slideIn]
})
export class CategoryComponent implements OnInit {
  show = false;
  form: FormGroup;
  categories: Category[];
  categoryPDF: Category[];
  parentCategory: Category[];
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
      title: 'Category',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };

    this.toasterService.pop(toast);
  }
  constructor(private fb: FormBuilder, private toasterService: ToasterService,
    private routeService: ActivatedRoute, private categoryService: CategoryService) {
    this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        // console.log('Event Fire At : ', data);
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getAllCategory(this.itemsPerPage, this.pageIndex, '');
      });
    this.sortDir = 'asc';
    this.sortCol = 'id';
    this.ddlitemsPerPage = this.itemsPerPage;
    this.form = fb.group({
      categorie: ['', Validators.compose([Validators.required, this.nospaceValidator])],
      parent_category: ['', Validators.compose([Validators.required])]
    });
  }
  nospaceValidator(control: AbstractControl) {
    if (control.value && control.value.toString().trim().length === 0) {
      control.setValue('');
      return { nospace: true };
    }
  }
  ngOnInit() {
    this.getParentCategory();
    this.getAllCategory(this.itemsPerPage, this.pageIndex, '');
  }
  getParentCategory() {
    this.categoryService.getAllCategories(0).subscribe(
      res => {
        this.parentCategory = res;
      },
      err => {
        console.log('error');
      }
    );
  }
  setItemsPerPage() {
    this.itemsPerPage = this.ddlitemsPerPage;
    this.getAllCategory(this.itemsPerPage, this.pageIndex, '');
  }
  onEnter(value: string) {
    this.getAllCategory(this.itemsPerPage, this.pageIndex, value);
  }
  getPage(page: number) {
    this.pageIndex = page;
    this.getAllCategory(this.itemsPerPage, this.pageIndex, '');
  }
  getAllCategory(itemsPerPage: number, pageIndex: number, searchkey: any) {

    this.categoryService.getPaginationCategories(itemsPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(
      res => {
        this.categories = res['data'];
        this.categories.forEach(category => {
          const dateFormat = 'YYYY-DD-MM HH:mm:ss';
          const testDateUtc = moment.utc(category.updated_at);
          const localDate = testDateUtc.local();
          category.updated_at = localDate;
        });
        this.totalItems = res['total'];
        this.last_page = res['last_page'];
      },
      err => {
        console.log('error');
      }
    );

  }
  onSubmit() {
    if (this.form.valid) {
      if (!this.formEditMode === true) {
        this.categoryService.addCategory(this.form.value).subscribe(
          res => {
            if (res.status === 'inValid') {
              this.popToast(res.errors.categorie, '51');
            } else {
              this.popToast('Category saved successfully', '');
              this.getAllCategory(this.itemsPerPage, this.pageIndex, '');
              this.resetForm();
            }
          },
          error => {
            this.popToast('Unable to save category', '50');
          }
        );
      } else {
        this.categoryService.updateCategory(this.form.value, this.editId).subscribe(
          res => {
            if (res.status === 'inValid') {
              this.popToast(res.errors.categorie, '51');
            } else {
              this.popToast('Category updated successfully !!', '');
              this.getAllCategory(this.itemsPerPage, this.pageIndex, '');
              this.resetForm();
            }
          },
          err => {
            this.popToast('Unable to update category', '50');
            this.getAllCategory(this.itemsPerPage, this.pageIndex, '');
          }
        );
      }
    }
  }
  getEditCategory(id: string) {
    this.editId = id;
    this.show = true;
    this.formEditMode = true;
    this.categoryService.getCategoryEdit(id).subscribe(catdata => {
      this.form.patchValue({
        categorie: catdata.categorie,
        parent_category: catdata.parent_category
      });

    }, err => {
      console.log('error');
    });
  }
  deleteCategory(id: string) {
    this.categoryService.deleteCategory(id).subscribe(res => {
      if (res['status'] === 'warning') {
        this.popToast(res['message'], '51');
      } else if (res['status'] === 'success') {
        this.popToast('Category deleted successfully !!', '');
        this.getParentCategory();
        this.getAllCategory(this.itemsPerPage, this.pageIndex, '');
      } else {
        this.popToast(res['error'], '50');
      }
    }, err => {
      this.popToast('Unable to delete category', '50');
      this.getAllCategory(this.itemsPerPage, this.pageIndex, '');
    });
  }
  resetForm() {
    this.formEditMode = false;
    this.getParentCategory();
    this.form.reset();
    this.show = false;
  }
  reset() {
    this.form.reset();
  }
  generateXls() {
    this.categoryService.getXls().subscribe(
      res => {
        importedSaveAs(res, 'category');
      }
    );
  }
  generatePDF() {
    this.categoryService.getCategoryAll().subscribe(
      res => {
        this.categoryPDF = res;
        this.exportToPDF();
      }
    );
  }
  exportToPDF() {
    const columns = [
      { title: 'Category No', dataKey: 0 },
      { title: 'Category', dataKey: 1 },
      { title: 'Parent Category', dataKey: 2 },
      { title: 'Created Date', dataKey: 3 }
    ];
    const rows = [];
    this.categoryPDF.forEach(category => {
      rows.push({
        0: category.id, 1: category.categorie,
        2: category.parent_category === 0 ? 'Parent Category' : category.parent_cat.categorie,
        3: category.created_at
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
        doc.text('Category ', doc.internal.pageSize.width / 2, 35, 'center');
      }
    });
    doc.save('Category.pdf');
  }

}
