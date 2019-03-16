import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ItemComponent } from '../item/item.component';
import { StarterHeaderComponent } from '../layout/starter-header/starter-header.component';
import { EventEmiterService } from '../shared/event-emitter.service';
import { trigger, animate, style, group, animateChild, query, stagger, transition, state } from '@angular/animations';

import { } from 'jquery';
import { } from 'morris.js';
import { } from 'jquery-knob';
import { } from 'bootstrap-datepicker';
import { } from 'jqueryui';
import { } from 'daterangepicker';
import { } from 'jquery.slimscroll';
import { AfterViewInit, AfterContentInit } from '@angular/core';
declare var AdminLTE: any;
@Component({
  selector: 'app-starter',
  templateUrl: './starter.component.html',
  styleUrls: ['./starter.component.css'],
  // animations: [
  //   trigger('routerTransition', [
  //     transition('* <=> *', [
  //       query(':enter, :leave', style({
  //         position: 'fixed',
  //         width: '100%',
  //         opacity: 1
  //       })),
  //       group([
  //         query(':enter', [
  //           style({ opacity: 0 }),
  //           animate('1200ms ease-in-out', style({
  //             position: 'fixed',
  //             width: '100%',
  //             opacity: 1
  //           }))
  //         ]),
  //         query(':leave', [
  //           style({
  //             opacity: 1
  //           }),
  //           animate('1200ms ease-in-out', style({ opacity: 0 }))]),
  //       ])
  //     ])
  //   ])
  // ]
})
export class StarterComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  bodyClasses = 'skin-red sidebar-mini';
  body: HTMLBodyElement = document.getElementsByTagName('body')[0];

  constructor() { }

  ngOnInit() {
    // add the the body classes
    this.body.classList.add('skin-red');
    this.body.classList.add('sidebar-mini');
  }
  ngAfterViewInit(): void {
  }

  ngAfterViewChecked(): void {
  //  AdminLTE.init();
  }

  ngOnDestroy() {
    // remove the the body classes
    this.body.classList.remove('skin-blue');
    this.body.classList.remove('sidebar-mini');
  }

}
