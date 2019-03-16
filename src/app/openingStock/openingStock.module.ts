import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { OpeningStockComponent } from './openingStock.component';
import { OpeningStockService } from './openingStock.service';
import { BrowserXhr, HttpModule } from '@angular/http';
import { NgProgressModule, NgProgressBrowserXhr } from 'ngx-progressbar';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { ToasterModule } from 'angular2-toaster';
import { NgxPaginationModule } from 'ngx-pagination';
import { CategoryService } from '../category/category.service';
import { UnitService } from '../unit/unit.service';
import { ItemService } from '../item/item.service';
import { ShowErrorsComponent } from '../shared/showerrors.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        MyDatePickerModule,
        ReactiveFormsModule,
        NguiAutoCompleteModule,
        NgProgressModule,
        ToasterModule,
        NgxPaginationModule,
        SharedModule,
        RouterModule,
    ],
    declarations: [
        OpeningStockComponent
    ],
    exports: [OpeningStockComponent],
    providers: [OpeningStockService,
        CategoryService, UnitService, ItemService,
        { provide: BrowserXhr, useClass: NgProgressBrowserXhr }
    ]
})
export class OpeningStockModule { }
