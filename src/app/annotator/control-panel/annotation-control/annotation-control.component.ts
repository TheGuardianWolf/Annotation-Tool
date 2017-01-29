import { Component, OnInit } from '@angular/core';
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

    // Shortcut accessors for template binding
    get annotation() {
        return this.ws.workspace.annotation;
    }

    get currentFrame() {
        return this.ws.workspace.annotation.frames[this.ws.workspace.currentFrameIndex];
    }

    get currentFrameHasPeople() {
        return this.currentFrame.people.length > 0;
    }
    // End of shortcut accessors

    private currentPersonIndex: number = 0;

    private addPerson() {
    }

    private removePerson() {
    }

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    ngOnInit() {
        $.material.init();
    }
}
