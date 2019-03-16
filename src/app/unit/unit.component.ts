import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { UnitService } from './unit.service';
import { Unit } from './unit';
import * as moment from 'moment';
import { ToasterService, Toast, ToasterConfig, BodyOutputType } from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
import { EventEmiterService } from '../shared/event-emitter.service';
declare var require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');
declare var jquery: any;
declare var $: any;
import { slideIn } from '../shared/animation';
import { WindowRef } from '../shared/windowRef';

@Component({
    selector: 'app-unit',
    templateUrl: './unit.component.html',
    styleUrls: ['./unit.component.css'],
    animations: [slideIn]
})

export class UnitComponent implements OnInit, AfterViewInit {
    show = false;
    pageIndex = 1;
    ddlitemsPerPage: any;
    itemsPerPage = 10;
    totalItems = 0;
    last_page: number;
    form: FormGroup;
    units: Unit[];
    formEditMode = false;
    editId: string;
    searchKey: any;
    sortCol: string;
    sortDir: string;
    queryParams: any;
    allUnits = [];
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
            title: 'Unit',
            body: message,
            bodyOutputType: BodyOutputType.TrustedHtml
        };
        this.toasterService.pop(toast);
    }
    constructor(private window: WindowRef, private fb: FormBuilder, private unitService: UnitService,
        private toasterService: ToasterService, private routeService: ActivatedRoute,
        private _eventEmiter: EventEmiterService) {
        this.routeService.queryParams
            .filter(params => 'sort' in params)
            .map(params => params)
            .distinctUntilChanged()
            .subscribe(data => {
                this.sortCol = data['sort'];
                this.sortDir = data['dir'];
                this.getUnits(this.itemsPerPage, this.pageIndex, '');
            });
        this.sortDir = 'asc';
        this.sortCol = 'id';
        this.ddlitemsPerPage = this.itemsPerPage;
        this.form = fb.group({
            unit: ['', Validators.compose([Validators.required, this.nospaceValidator])]
        });
    }
    ngOnInit() {
        this.getUnits(this.itemsPerPage, this.pageIndex, '');
    }
    nospaceValidator(control: AbstractControl) {
        if (control.value && control.value.toString().trim().length === 0) {
            control.setValue('');
            return { nospace: true };
        }
    }
    ngAfterViewInit(): void {
        this._eventEmiter.emitChange('Collapse from Unit');
    }
    private noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
    }
    generatePDF() {
        this.unitService.getUnit().subscribe(
            res => {
                this.allUnits = res;
                this.exportToPDF();
            }
        );
    }
    exportToPDF() {
        const columns = [
            { title: 'Unit No', dataKey: 0 },
            { title: 'Unit', dataKey: 1 },
            { title: 'Created Date', dataKey: 2 }
        ];
        const rows = [];
        this.allUnits.forEach(unit => {
            rows.push({
                0: unit.id, 1: unit.unit,
                2: unit.created_at
            });
        });
        const doc = new jsPDF('p', 'pt');
        doc.rect(15, 15, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 40, 'S');
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
                doc.text('Units ', doc.internal.pageSize.width / 2, 35, 'center');
            }
        });
        doc.save('Units.pdf');
    }
    getPage(page: number) {
        this.pageIndex = page;
        this.getUnits(this.itemsPerPage, this.pageIndex, '');
    }

    setItemsPerPage() {
        this.itemsPerPage = this.ddlitemsPerPage;
        this.getUnits(this.itemsPerPage, this.pageIndex, '');
    }

    getUnits(itemsPerPage: number, pageIndex: number, searchkey: any) {
        this.unitService.getPaginateUnit(itemsPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(units => {
            this.units = units['data'];
            this.units.forEach(unit => {
                const dateFormat = 'YYYY-DD-MM HH:mm:ss';
                const testDateUtc = moment.utc(unit.updated_at);
                const localDate = testDateUtc.local();
                unit.updated_at = localDate;
            });
            this.totalItems = units['total'];
            this.last_page = units['last_page'];
        }, err => {
            console.log('error');
        });
    }
    onSubmit() {
        if (this.form.valid) {
            if (!this.formEditMode === true) {
                this.unitService.addUnit(this.form.value).subscribe(
                    res => {
                        if (res.status === 'inValid') {
                            this.popToast(res.errors.unit, '51');
                        } else {
                            this.popToast('Unit saved successfully', '');
                            this.getUnits(this.itemsPerPage, this.pageIndex, '');
                            this.resetForm();
                        }
                    },
                    error => {

                        this.popToast('Unable to save unit', '50');
                        console.log(error);
                    }
                );
            } else {
                this.unitService.updateUnit(this.form.value, this.editId).subscribe(
                    res => {
                        if (res.status === 'inValid') {
                            this.popToast(res.errors.unit, '51');
                        } else {
                            this.popToast('Unit updated successfully !!', '');
                            this.getUnits(this.itemsPerPage, this.pageIndex, '');
                            this.resetForm();
                            this.show = false;
                        }
                    },
                    err => {
                        this.popToast('Unable to update unit', '50');
                        this.getUnits(this.itemsPerPage, this.pageIndex, '');
                    }
                );
            }
        }
    }

    getEditUnit(id: string) {
        this.editId = id;
        this.show = true;
        this.formEditMode = true;
        this.unitService.getUnitEdit(id).subscribe(unitdata => {
            this.form.patchValue({
                unit: unitdata.unit,
            });
        }, err => {
            console.log('error');
        });
    }

    deleteUnit(id: string) {
        this.unitService.deleteUnits(id).subscribe(res => {
            if (res['status'] === 'success') {
                this.popToast(res['message'], '');
            } else if (res['status'] === 'warning') {
                this.popToast(res['message'], '51');
            }
            this.getUnits(this.itemsPerPage, this.pageIndex, '');
        }, err => {
            this.popToast('Unable to delete unit', '50');
            this.getUnits(this.itemsPerPage, this.pageIndex, '');
        });
    }

    resetForm() {
        this.show = false;
        this.formEditMode = false;
        this.form.reset();
    }

    reset() {
        this.form.reset();

    }

    onEnter(value: string) {
        this.getUnits(this.itemsPerPage, this.pageIndex, value);
    }

    cancel() {
        this.form.reset();
        this.show = false;
        this.formEditMode = false;
    }

}
