import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Location } from '@angular/common';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

declare var $;

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
        if (create) {
            this.ws.init({
                directory: this.createForm.get('directory').value,
                video: this.createForm.get('video').value,
                annotation: this.createForm.get('annotation').value
            });
        }
        else {
            this.ws.init({
                directory: this.loadForm.get('directory').value,
                annotation: this.loadForm.get('annotation').value
            });
        }
        this.router.navigate(['/annotator']);
    }
}
