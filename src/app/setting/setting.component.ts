import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';
import { AfterViewChecked } from '@angular/core/src/metadata/lifecycle_hooks';
declare var AdminLTE: any;
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
// tslint:disable-next-line:one-line
export class SettingComponent implements OnInit, OnDestroy, AfterViewChecked {

  bodyClasses = 'skin-red sidebar-mini';
  body: HTMLBodyElement = document.getElementsByTagName('body')[0];

  constructor(private http: Http) { }
  ngAfterViewChecked(): void {
    AdminLTE.init();
  }
  ngOnInit() {
    // add the the body classes
    this.body.classList.add('skin-red');
    this.body.classList.add('sidebar-mini');
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // remove the the body classes
    this.body.classList.remove('skin-blue');
    this.body.classList.remove('sidebar-mini');
  }

}
