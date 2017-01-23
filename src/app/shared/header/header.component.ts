import { Component } from '@angular/core';
import { Location } from '@angular/common';

import { WorkspaceService } from '../workspace/workspace.service';

/**
 * This class represents the navigation bar component.
 */
@Component({
  selector: 'at-header',
  template: require('./header.component.html'),
  //styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    private location: Location;
    private ws: WorkspaceService;

    public showLoader: boolean = false;

    constructor(_location: Location, _ws: WorkspaceService) { 
        this.location = _location
        this.ws = _ws;
    }

    backPressed() {
        this.location.back();
    }
}
