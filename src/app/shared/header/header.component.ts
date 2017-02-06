import { Component } from '@angular/core';
import { Location } from '@angular/common';

import { WorkspaceService } from '../workspace/workspace.service';
import { StatusService } from '../status/status.service';

/**
 * This class represents the navigation bar component.
 */
@Component({
  selector: 'at-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
    private location: Location;
    private ws: WorkspaceService;
    private ss: StatusService;

    public showLoader: boolean = false;

    constructor(_location: Location, _ws: WorkspaceService, _ss:StatusService) { 
        this.location = _location
        this.ws = _ws;
        this.ss = _ss;
    }

    backPressed() {
        this.location.back();
    }
}
