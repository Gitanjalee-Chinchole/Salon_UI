import { Component } from '@angular/core';
import 'admin-lte';
import { OnInit } from '@angular/core';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'app';
  ngOnInit(): void {
    //  jQuery.AdminLTE.layout.activate();
    //  $.AdminLTE.controlSidebar.open();
    // $.AdminLTE.options.layout.fix();
    // console.log($.AdminLTE.controlSidebar);
    //   $.AdminLTE.layout.activate();
  }
  ngAfterViewInit(): void {
    //   const o = $.AdminLTE.options;
    // console.log($.AdminLTE.pushMenu);
  }
}

