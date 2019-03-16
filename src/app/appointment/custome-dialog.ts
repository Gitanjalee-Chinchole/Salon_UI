import { ViewEncapsulation, Component } from '@angular/core';

import { FlightControlDialogData } from './custome-control-dialog-data';
import { ModalComponent, DialogRef } from 'ngx-modialog';

import {
    VEXDialogButtons
} from 'ngx-modialog/plugins/vex';


@Component({
    selector: 'modal-content',
    styles: [`
    modal-header {
        padding: 15px;
        border-bottom: 1px solid #e5e5e5;
    `],
    encapsulation: ViewEncapsulation.None,

    template:
        `<div class="model-header">{{context.message}}</div>
        <h4>Alert is a classic (title/body/footer) 1 button modal window that 
        does not block.</h4>
        <b>Configuration:</b>
        <ul>
            <li>Non blocking (click anywhere outside to dismiss)</li>
            <li>Size large</li>
            <li>Dismissed with default keyboard key (ESC)</li>
            <li>Close wth button click</li>
            <li>HTML content</li>
        </ul>
    <div class="vex-dialog-input">
        <input name="vex" 
               type="text" 
               class="vex-dialog-prompt-input form-control"
               #answer (keyup)="onKeyUp(answer.value)"
               [(ngModel)]="context.defaultResult" 
               placeholder="{{context.placeholder}}">
    </div>
    <button (click)="submit()">Submit</button>
    `
})

export class FlightControlDialog implements ModalComponent<FlightControlDialogData>  {
    context: FlightControlDialogData;
    data: any;

    constructor(public dialog: DialogRef<FlightControlDialogData>) {
        this.context = dialog.context;
        dialog.setCloseGuard(this);
    }
    onKeyUp(value) {
        //  console.log(value);
        this.data = value;
        // this.dialog.close();
    }
    beforeDismiss(): boolean {
        return true;
    }
    beforeClose(): boolean {
        return this.data;
    }
    submit() {
        // console.log(this.context);
        this.dialog.close(this.data);
    }
}