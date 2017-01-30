import { Component, OnInit, forwardRef, Input, ViewChild, ElementRef } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import * as path from 'path';

declare var $;

// Validation for file-electron inputs not currently working
export function createMaterialCheckboxComponentValidator(extension) {
    return (c: FormControl) => {
        //let match = new RegExp('/' + extension + '$/', 'i');
        //return match.test(c.value) ? null : {
        //    validateExtension: {
        //        valid: false
        //    }
        //};
        return null;
    }
}

@Component({
    selector: 'material-checkbox',
    templateUrl: './material-checkbox.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MaterialCheckboxComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => MaterialCheckboxComponent), multi: true }
    ]
})

export class MaterialCheckboxComponent implements ControlValueAccessor, OnInit {
    @ViewChild('checkboxInput') checkboxInput: ElementRef;

    private _value: boolean = false;

    get value() {
        return this._value;
    }

    set value(val) {
        if (val !== this._value) {
            this._value = val;
            this.propagateChange(val);
        }
    }

    onTouched: any = () => { };
    propagateChange: any = () => { };
    validateFn: any = () => { };

    @Input() inputId;
    @Input() name;

    ngOnChanges(inputs) {
        if (inputs.extension) {
            this.validateFn = createMaterialCheckboxComponentValidator(inputs.extension);
        }
    }

    onBlur() {
        this.onTouched();
    }

    writeValue(value) {
        if (value !== this._value) {
            this._value = value;
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn) {
        this.onTouched = fn;
    }

    validate(c: FormControl) {
        return this.validateFn(c);
    }

    ngOnInit() {
        $.material.checkbox(this.checkboxInput.nativeElement);
    }
}
