import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
declare var AdminLTE: any;

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.css']
})
export class PackageComponent implements OnInit, OnDestroy, AfterViewChecked {


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
    if (AdminLTE !== undefined && this.layoutFix === 0) {
      AdminLTE.init();
      this.layoutFix++;
    }
  }

  ngOnDestroy() {
    // remove the the body classes
    this.body.classList.remove('skin-blue');
    this.body.classList.remove('sidebar-mini');
  }


}
