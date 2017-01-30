import { Component, OnInit, forwardRef, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import * as path from 'path';

declare var $;

// Validation for file-electron inputs not currently working
export function createFileElectronValidator(extension) {
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
    selector: 'file-electron',
    templateUrl: './file-electron.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileElectronComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => FileElectronComponent), multi: true }
    ]
})

export class FileElectronComponent implements ControlValueAccessor, OnChanges, OnInit {
    @ViewChild('fileInput') fileInput: ElementRef;
    @ViewChild('fileInputDisplay') fileInputDisplay: ElementRef;

    onTouched: any = () => { };
    propagateChange: any = () => { };
    validateFn: any = () => { };

    @Input() inputId;
    @Input() name;
    @Input() webkitdirectory;
    @Input() extension;
    @Input() placeholder;
    @Input('path') _path;

    @Output()
    fileChange: EventEmitter<any>;

    get path() {
        return this._path;
    }

    set path(val) {
        this._path = val;
        this.propagateChange(this._path);
    }

    constructor(private ref: ChangeDetectorRef) {
        this.fileChange = new EventEmitter();
    }

    onBlur() {
        this.onTouched();
    }

    fileChanged(event) {
        this.path = event.target.files[0] ? 
            event.target.files[0].path : null;
        this.fileChange.emit(this.path);
    }

    ngOnChanges(inputs) {
        if (inputs.extension) {
            this.validateFn = createFileElectronValidator(inputs.extension);
        }
    }

    writeValue(value) {
        if (value !== this._path) {
            this._path = value;
            this.fileInputDisplay.nativeElement.value =
                value ? path.parse(this._path).base : null;
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
        $.material.input(this.fileInput.nativeElement);
    }
}
