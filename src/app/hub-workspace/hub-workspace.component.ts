import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
const $ = require('jquery');

interface ICreate {
    directory: string;
    videoFile: string;
    annotationFile?: string;
}

interface ILoad {
    directory: string;
    annotationFile?: string;
}

/**
 * This class represents the lazy loaded HubWorkspaceComponent.
 */
@Component({
    selector: 'HubWorkspace',
    templateUrl: './hub-workspace.component.html',
    //styleUrls: ['./hub-start.component.scss'],
})

export class HubWorkspaceComponent implements OnInit {
    public createForm: FormGroup;
    public loadForm: FormGroup;

    constructor(fb: FormBuilder) {
        this.createForm = fb.group({
            'directory': [null, Validators.required],
            'video': [null, Validators.required],
            'annotation': [null]
        });
        this.loadForm = fb.group({
            'directory': [null, Validators.required],
            'annotation': [null]
        });
    }

    ngOnInit() {
        console.log('HubWorkspace');
        $.material.init();
    }

    createWorkspace() {
        console.log('Creating a workspace');
    }

    loadWorkspace() {
        console.log('Loading a workspace');
    }
}
