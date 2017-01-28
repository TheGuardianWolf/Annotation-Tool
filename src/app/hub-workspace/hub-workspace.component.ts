import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

declare var $;

import { IWorkspaceConfig, WorkspaceService } from '../shared/workspace/workspace.service';

/**
 * This class represents the lazy loaded HubWorkspaceComponent.
 */
@Component({
    selector: 'hub-workspace',
    templateUrl: './hub-workspace.component.html',
    //styleUrls: ['./hub-start.component.scss'],
})

export class HubWorkspaceComponent implements OnInit {
    private router: Router;
    public ws: WorkspaceService;

    public createForm: FormGroup;
    public loadForm: FormGroup;

    constructor(_fb: FormBuilder, _ws: WorkspaceService, _router: Router) {
        this.router = _router;
        this.ws = _ws;

        this.createForm = _fb.group({
            'directory': [null, Validators.required],
            'video': [null, Validators.required],
            'annotation': [null]
        });
        this.loadForm = _fb.group({
            'directory': [null, Validators.required],
            'annotation': [null]
        });
    }

    ngOnInit() {
        $.material.init();
    }

    initWorkspace(event: Event, create: boolean) {
        event.preventDefault();
        let promise: Q.Promise<{}>;
        if (create) {
            promise = this.ws.init({
                directory: this.createForm.get('directory').value,
                video: this.createForm.get('video').value,
                annotation: this.createForm.get('annotation').value
            });
        }
        else {
            promise = this.ws.init({
                directory: this.loadForm.get('directory').value,
                annotation: this.loadForm.get('annotation').value
            });
        }
        
        promise.done(() => {
            // The following does not work due to an angular bug, 
            // issue reported at https://github.com/angular/angular/issues/13953

            // this.router.navigate(['/annotator']);

            // location.href used as workaround
            location.href = __filename + '#/annotator'
        }, (err) => {
            throw err;
        });
    }
}
