import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
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
    public ws: WorkspaceService;

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    ngOnInit() {
        $.material.init();
    }
}
