import { Component } from '@angular/core';
import { Location } from '@angular/common';

/**
 * This class represents the navigation bar component.
 */
@Component({
  selector: 'at-header',
  template: require('./header.component.html'),
  //styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    public showLoader: boolean = false;

    constructor(
        private _location: Location
    ) { }

    backPressed() {
        this._location.back();
    }
}
