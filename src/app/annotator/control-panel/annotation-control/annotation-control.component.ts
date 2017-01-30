import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { Person, Point, BoundingBox } from '../../../shared/classes/storage';
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
    get data() {
        return this.ws.annotation.data;
    }

    get currentFrame() {
        return this.ws.annotation.data.frames[this.ws.annotation.currentFrameIndex];
    }

    get currentFrameHasPeople() {
        return this.currentFrame.people.length > 0;
    }
    // End of shortcut accessors

    private currentPersonIndex: number = 0;

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    private addPerson() {
        // TODO: Add paper bounding box
        this.currentFrame.addPerson(
            new Person(0, false, new BoundingBox(null, null, null, null), new Point(null, null), new Point(null, null), null)
        );
    }

    private removePerson() {
        // TODO: Remove paper bounding box
        this.currentFrame.people.splice(this.currentPersonIndex, 1);
    }

    ngOnInit() {
        $.material.init();
    }
}
