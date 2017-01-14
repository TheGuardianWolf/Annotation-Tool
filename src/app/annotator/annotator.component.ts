import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

/**
 * This class represents the lazy loaded HubStartComponent.
 */
@Component({
    selector: 'Annotator',
    templateUrl: './annotator.component.html',
    //styleUrls: ['./annotator.component.scss'],
})

export class AnnotatorComponent implements OnInit {
    constructor(
    ) { }

    ngOnInit() {
        console.log('Annotator');
    }

    goToTerminal() {
    }

    goToAnnotate() {
    }
}
