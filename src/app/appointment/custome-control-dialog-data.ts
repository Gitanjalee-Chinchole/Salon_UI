import {
    Component,
    ViewEncapsulation
} from '@angular/core';

import { ModalComponent, DialogRef } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';


import {
    DialogPreset,
    VEXDialogButtons
} from 'ngx-modialog/plugins/vex';

export class FlightControlDialogData extends BSModalContext {
    constructor(public flightcontrol: any) {
        super();
        this.message = "It's Irfan";
        this.isBlocking = false;
        this.showClose = true;
    }
}