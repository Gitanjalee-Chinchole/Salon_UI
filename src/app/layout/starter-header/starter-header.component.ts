import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { EventEmiterService } from '../../shared/event-emitter.service';


@Component({
  selector: 'app-header',
  templateUrl: './starter-header.component.html',
  styleUrls: ['./starter-header.component.css']
})
export class StarterHeaderComponent implements OnInit {
  body: HTMLBodyElement = document.getElementsByTagName('body')[0];
  constructor(private renderer: Renderer, private _eventEmiter: EventEmiterService,
    private elRef: ElementRef) { }

  ngOnInit() {
    this._eventEmiter.changeEmitted$.subscribe(ss => {
      setTimeout(() => {
        this.body.classList.add('sidebar-collapse');
      }, 2000);

    },
      err => { console.log('errrrr'); });
  }

}
