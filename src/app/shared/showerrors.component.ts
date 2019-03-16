import { Component, Input } from '@angular/core';
import { AbstractControlDirective, AbstractControl } from '@angular/forms';
import { error } from 'util';


@Component({
    selector: 'show-errors',
    template: `
   <ul *ngIf="shouldShowErrors()" class="validation-errors">
     <li style="color: #f72c13">{{getError()}}</li>
   </ul>
 `,
})
export class ShowErrorsComponent {
    private static readonly errorMessages = {
        'required': (params) => '##FIELD## is required',
        'minlength': (params) => '##FIELD## should be minimum ' + params.requiredLength + ' characters',
        'minlengthMobile': (params) => '##FIELD## should be minimum ' + params.requiredLength + ' characters',
        'maxlength': (params) => '##FIELD## should not be greater then ' + params.requiredLength + ' characters',
        'pattern': (params) => '##FIELD## should be a valid',
        'vaildEmail': (params) => 'Should be vaild email.',
        'vaildPhone': (params) => '##FIELD##' + params.message,
        'whiteSpace': (params) => params.message,
        'email': (params) => 'Should be vaild email.',
        'onlyNumeric': (params) => '##FIELD## ' + params.message,
        'decimal': (params) => '##FIELD## ' + params.message,
        'emailNotUnique': (params) => 'Email already taken.',
        'phoneNotUnique': (params) => 'Phone no already taken.',
        'mobileNotUnique': (params) => 'Mobile no already taken.',
        'qtyGreaterThanStock': (params) => 'Quantity does not allow greater than stock',
        'zeroNotAllowed': (params) => '##FIELD## ' + params.message,
    };
    @Input()
    private control: AbstractControlDirective | AbstractControl;
    shouldShowErrors(): boolean {
        return this.control &&
            this.control.errors &&
            (this.control.dirty || this.control.touched);
    }

    listOfErrors(): string[] {
        return Object.keys(this.control.errors)
            .map(field => this.getMessage(field, this.control.errors[field], this.control));
    }

    getError(): string {
        // console.log("show", this.control.errors);
        // console.log(this.listOfErrors());
        //   console.log("show", this.control.errors);
        const errors = Object.keys(this.control.errors)
            .map(field =>
                this.getMessage(field, this.control.errors[field], this.control)
            );
        return errors[0];
    }

    private getMessage(type: string, params: any, control: any) {

        //  console.log(params);
        let fname = this.getControlName(control);
        fname = fname.replace('_', ' ').replace(' id', '').replace('Id', '').toLowerCase();
        fname = fname.replace('_', ' ').toLowerCase();
        fname = fname.replace(/\b\w/g, l => l.toUpperCase());
        const msg = ShowErrorsComponent.errorMessages[type](params);
        //   console.log(msg);
        return msg.replace('##FIELD##', fname);
    }

    getControlName(c: AbstractControl): string | null {
        const formGroup = c.parent.controls;
        return Object.keys(formGroup).find(name => c === formGroup[name]) || null;
    }
}
