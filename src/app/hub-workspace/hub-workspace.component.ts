import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Location } from '@angular/common';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

const $ = require('jquery');

import { IWorkspaceConfig, WorkspaceService } from '../shared/workspace/workspace.service';

/**
 * This class represents the lazy loaded HubWorkspaceComponent.
 */
@Component({
    selector: 'HubWorkspace',
    templateUrl: './hub-workspace.component.html',
    //styleUrls: ['./hub-start.component.scss'],
})

export class HubWorkspaceComponent implements OnInit {
    private _router: Router;
    public _ws: WorkspaceService;

    public createForm: FormGroup;
    public loadForm: FormGroup;

    constructor(_fb: FormBuilder, _ws: WorkspaceService, _router: Router) {
        this._router = _router;
        this.createForm = _fb.group({
            'directory': [null, Validators.required],
            'video': [null, Validators.required],
            'annotation': [null]
        });
        this.loadForm = _fb.group({
            'directory': [null, Validators.required],
            'annotation': [null]
        });
        this._ws = _ws;
    }

    ngOnInit() {
        console.log('HubWorkspace');
        $.material.init();
    }

    initWorkspace(event: Event, create: boolean) {
        event.preventDefault();
        if (create) {
            this._ws.init({
                directory: this.createForm.get('directory').value,
                video: this.createForm.get('video').value,
                annotation: this.createForm.get('annotation').value
            });
        }
        else {
            this._ws.init({
                directory: this.loadForm.get('directory').value,
                annotation: this.loadForm.get('annotation').value
            });
        }
        this._router.navigate(['annotator']);
    }
}
