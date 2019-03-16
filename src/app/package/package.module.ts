import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Safe } from '../confirm/safehtml.component';
import { OpeningStockModule } from '../openingStock/openingStock.module';
import { ItemComponent } from '../item/item.component';
import { PackageSetupComponent } from './package-setup/package-setup.component';
import { StarterComponent } from '../starter/starter.component';
import { LayoutModule } from '../layout/layout.module';
import { StarterHeaderComponent } from '../layout/starter-header/starter-header.component';
import { StarterLeftSideComponent } from '../layout/starter-left-side/starter-left-side.component';
import { StarterContentComponent } from '../layout/starter-content/starter-content.component';
import { StarterFooterComponent } from '../layout/starter-footer/starter-footer.component';
import { StarterControlSidebarComponent } from '../layout/starter-control-sidebar/starter-control-sidebar.component';
import { RouterModule } from '@angular/router';
import { PackageComponent } from './package.component';
import { PackageRoutingModule } from './package-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../shared/shared.module';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { PackageSetupService } from './package-setup/package-setup.service';
import { PackageAssignmentComponent } from './package-assignment/package-assignment.component';
import { PackageAssignmentService } from './package-assignment/package-assignment.service';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
    imports: [
        CommonModule,
        PackageRoutingModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        ToasterModule,
        RouterModule,
        SharedModule,
        NguiAutoCompleteModule,
        MyDatePickerModule,
    ],
    declarations: [
        PackageComponent,
        PackageSetupComponent,
        PackageAssignmentComponent
        // StarterHeaderComponent,
        // StarterLeftSideComponent,
        // StarterFooterComponent,
        // StarterControlSidebarComponent,
    ],
    providers: [Safe,
        PackageSetupService, PackageAssignmentService],
    exports: [PackageComponent]
})
export class PackageModule { }
