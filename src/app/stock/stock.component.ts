import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { StarterHeaderComponent } from '../layout/starter-header/starter-header.component';
import { } from '@angular/core/src/metadata/lifecycle_hooks';
declare var AdminLTE: any;
@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit, OnDestroy, AfterViewChecked {

  bodyClasses = 'skin-red sidebar-mini';
  layoutFix = 0;
  body: HTMLBodyElement = document.getElementsByTagName('body')[0];

  constructor() { }
  ngOnInit() {
    // add the the body classes
    this.body.classList.add('skin-red');
    this.body.classList.add('sidebar-mini');
  }
  ngAfterViewChecked(): void {
    // console.log(AdminLTE);
    // if (AdminLTE !== undefined && this.layoutFix === 0 && AdminLTE !== Object) {
    //   console.log(AdminLTE);
    //   AdminLTE.init();
    //   this.layoutFix++;
    // }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // remove the the body classes
    this.body.classList.remove('skin-blue');
    this.body.classList.remove('sidebar-mini');
  }

}
