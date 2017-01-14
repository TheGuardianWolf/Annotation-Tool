import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
const $ = require('jquery');

/**
 * This class represents the lazy loaded HubStartComponent.
 */
@Component({
    selector: 'HubStart',
    templateUrl: './hub-start.component.html',
    //styleUrls: ['./hub-start.component.scss'],
})

export class HubStartComponent implements OnInit {
    constructor(
    ) { }

    ngOnInit() {
        console.log('HubStart');
        $.material.init();
    }
}
