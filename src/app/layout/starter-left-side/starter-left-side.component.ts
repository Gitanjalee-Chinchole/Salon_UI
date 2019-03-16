import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-left-side',
  templateUrl: './starter-left-side.component.html',
  styleUrls: ['./starter-left-side.component.css']
})
export class StarterLeftSideComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  collapse() {
    console.log('ites working');
  }

}
