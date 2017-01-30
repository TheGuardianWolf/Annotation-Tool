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

    get frame() {
        return this.ws.annotation.data.frames[this.ws.annotation.currentFrameIndex];
    }

    get frameHasPeople() {
        return this.frame.people.length > 0;
    }

    get person() {
        return this.ws.annotation.data.frames[this.ws.annotation.currentFrameIndex].people[this.ws.annotation.currentPerson];
    }
    // End of shortcut accessors

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    private addPerson() {
        // TODO: Add paper bounding box
        this.frame.addPerson(
            new Person(0, false, new BoundingBox(null, null, null, null), new Point(null, null), new Point(null, null), null)
        );
        this.ws.annotation.currentPerson = this.frame.people.length - 1
    }

    private removePerson() {
        // TODO: Remove paper bounding box
        if (this.ws.annotation.currentPerson === this.frame.people.length - 1) {
            this.ws.annotation.currentPerson--;
        }
        let newPeople = this.frame.people;
        newPeople.splice(this.ws.annotation.currentPerson, 1);
        this.frame.people = newPeople;
    }

    private nextPerson() {
        this.ws.annotation.currentPerson++;
    }

    private previousPerson() {
        this.ws.annotation.currentPerson--;
    }

    ngOnInit() {
        $.material.init();
    }
}
