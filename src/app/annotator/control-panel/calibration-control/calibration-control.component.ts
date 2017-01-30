import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { WorkspaceService } from '../../../shared/workspace/workspace.service';

declare var $;

/**
 * This class represents the lazy loaded HubStartComponent.
 */
@Component({
    selector: 'calibration-control',
    templateUrl: './calibration-control.component.html'
})

export class CalibrationControlComponent implements OnInit {
    public ws: WorkspaceService;
    get calibration() {
        return this.ws.calibration;
    }

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    ngOnInit() {
        $.material.init();
    }
}
