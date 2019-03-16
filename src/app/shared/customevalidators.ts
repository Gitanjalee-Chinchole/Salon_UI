import { FormArray, FormControl, FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';


export class CustomValidators {

    static vaildEmail(c: FormControl): ValidationErrors {
        const email = c.value;
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        let isValid = true;
        const message = {
            'vaildEmail': {
                'message': 'Should be valid email.'
            }
        };
        if (reg.test(email) || email === '' || c.value == null) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static minLengthValidate(c: FormControl): ValidationErrors {
        //  const num = Number(c.value);
        const isValid = c.value && c.value.length >= 1;
        const message = {
            'minlength': {
                'requiredLength': '1' // Will changes the error defined in errors helper.
            }
        };
        return isValid ? null : message;
    }

    static minValue(control: FormControl): { [s: string]: boolean } {
        console.log(control);
        const num = +control.value;
        if (isNaN(num) || num < 5) {
            return { 'minValue': true };
        } return null;
    }

    static OnlyNumericValidate(c: FormControl): ValidationErrors {
        const reg = /^[0-9]\d*$/;
        if (c.value && reg.test(c.value)) {
            return null;
        } else {
            const message = {
                'onlyNumeric': {
                    'message': 'Only numeric value allowed.'
                }
            };
            return message;
        }
    }

    static decimalValidate(c: AbstractControl): ValidationErrors {
        const reg = /^[0-9]\d*(\.\d+)?$/;
        //  const isRequired = this.isControlRequired(c);
        if (c.value == null || c.value === '' || reg.test(c.value)) {
            return null;
        } else {
            const message = {
                'pattern': ''
            };
            return message;
        }
    }

    static ageValidate(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= 18 && num <= 85;
        const message = {
            'age': {
                'message': 'The age must be a valid number between 18 and 85' // Will changes the error defined in errors helper.
            }
        };
        return isValid ? null : message;
    }
    static phoneNumberValidatorifnotempty(c: FormControl): ValidationErrors {
        const reg = /^[0-9]\d{2,4}-\d{6,10}$/;
        if (c.value === '' || c.value == null || reg.test(c.value)) {
            return null;
        } else {
            const message = {
                'vaildPhone': {
                    'message': ' should be valid Phone Number.'
                }
            };
            return message;
        }
    }
    static mobileNumberValidate(c: FormControl): ValidationErrors {
        const reg = /^[0-9]\d*$/;

        if (c.value === '' || c.value == null || reg.test(c.value) && c.value.length >= 9) {

            return null;
        } else {
            if (!reg.test(c.value)) {
                const message = {
                    'pattern': ''
                };
                return message;

            } else {
                const message = {
                    'minlengthMobile': {
                        'requiredLength': '9'
                    }
                };
                return message;
            }
        }
    }
    static onlyNumericValidateifnotempty(c: FormControl): ValidationErrors {
        const reg = /^[0-9]\d*$/;
        if (reg.test(c.value) || c.value === '' || c.value == null) {
            return null;
        } else {

            const message = {
                'onlyNumeric': {
                    'message': 'Only numeric value allowed.'
                }
            };
            return message;
        }
    }
    static nospaceValidator(abstractControl: AbstractControl) {
        if (abstractControl.validator) {
            const validator = abstractControl.validator({} as AbstractControl);
            if (validator && validator.required) {
                if (abstractControl.value && abstractControl.value.trim().length === 0) {
                    abstractControl.setValue('');
                    const message = {
                        'whiteSpace': {
                            'message': 'Space not allowed.'
                        }
                    };
                    return message;
                } else {
                    return null;
                }
            } else {
                if (abstractControl.value && abstractControl.value.trim().length === 0) {
                    abstractControl.setValue('');
                    return null;
                }
            }
        }
        // if (abstractControl['controls']) {
        //     for (const controlName in abstractControl['controls']) {
        //         if (abstractControl['controls'][controlName]) {
        //             if (hasRequiredField(abstractControl['controls'][controlName])) {
        //                 return true;
        //             }
        //         }
        //     }
        // }
    }
    static isControlRequired(abstractControl: AbstractControl): boolean {
        if (abstractControl.validator) {
            const validator = abstractControl.validator({} as AbstractControl);
            if (validator && validator.required) {
                return true;
            } else {
                return false;
            }
        }
    }

    static zeroNotAllowed(c: FormControl): ValidationErrors {
        const reg = 0;
        const v = parseInt(c.value);
        if ( v > 0 || c.value === '' || c.value == null) {
            return null;
        } else {

            const message = {
                'zeroNotAllowed': {
                    'message': 'greater than 0.'
                }
            };
            return message;
        }
    }
}
