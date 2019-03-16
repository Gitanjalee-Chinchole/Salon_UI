import { Component, OnInit, OnDestroy, AfterViewChecked, AfterViewInit } from '@angular/core';
declare var jquery: any;
declare var $: any;
declare var AdminLTE: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  bodyClasses = 'skin-red sidebar-mini';
  layoutFix = 0;
  body: HTMLBodyElement = document.getElementsByTagName('body')[0];

  constructor() { }

  ngOnInit() {
    // add the the body classes
    this.body.classList.add('skin-red');
    this.body.classList.add('sidebar-mini');
    //  this.body.classList.add('sidebar-collapse');
  }
  ngAfterViewInit(): void {
    //  $('#sidebar').trigger('click');
  }
  ngAfterViewChecked(): void {
    if (AdminLTE !== undefined && this.layoutFix === 0) {
      AdminLTE.init();
      this.layoutFix++;
    }
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // remove the the body classes
    this.body.classList.remove('skin-blue');
    this.body.classList.remove('sidebar-mini');
  }

}
