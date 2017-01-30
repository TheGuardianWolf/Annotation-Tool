import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { WorkspaceService } from '../../../shared/workspace/workspace.service';

declare var $;

/**
 * This class represents the lazy loaded HubStartComponent.
 */
@Component({
    selector: 'settings-control',
    templateUrl: './settings-control.component.html',
    //styleUrls: ['./settings-control.component.scss'],
})

export class SettingsControlComponent implements OnInit {
    // TODO: Impement box and location annotation modes
    // TODO: Control annotation intents for box and location
    private ws: WorkspaceService;
    get settings() {
        return this.ws.settings
    }

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    ngOnInit() {
        $.material.init();
    }
}
