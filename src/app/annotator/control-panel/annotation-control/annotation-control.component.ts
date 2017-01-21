import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { WorkspaceService } from '../../../shared/workspace/workspace.service';

declare var $;

/**
 * This class represents the lazy loaded HubStartComponent.
 */
@Component({
    selector: 'annotation-control',
    templateUrl: './annotation-control.component.html',
    //styleUrls: ['./annotation-control.component.scss'],
})

export class AnnotationControlComponent implements OnInit {
    public ws: WorkspaceService;

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    ngOnInit() {
        console.log(this.ws);
        $.material.init();
    }
}
