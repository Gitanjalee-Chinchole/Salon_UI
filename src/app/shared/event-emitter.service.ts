import { Injectable, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class EventEmiterService {
    private emitChangeSource = new Subject<any>();
    // Observable string streams
    changeEmitted$ = this.emitChangeSource.asObservable();
    // Service message commands
    constructor() { }

    emitChange(change: any) {
        this.emitChangeSource.next(change);
    }

}
