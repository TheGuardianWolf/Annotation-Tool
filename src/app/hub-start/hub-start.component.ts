import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
const $ = require('jquery');

/**
 * This class represents the lazy loaded HubStartComponent.
 */
@Component({
    selector: 'hub-start',
    templateUrl: './hub-start.component.html',
    //styleUrls: ['./hub-start.component.scss'],
})

export class HubStartComponent implements OnInit {
    constructor(
    ) { }

    ngOnInit() {
        $.material.init();
    }
}
