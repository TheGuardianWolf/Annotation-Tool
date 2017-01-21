import { Component } from '@angular/core';
import { Http } from '@angular/http';

/**
 * This class represents the lazy loaded HubStartComponent.
 */
@Component({
    selector: 'control-panel',
    templateUrl: './control-panel.component.html',
    //styleUrls: ['./control-panel.component.scss'],
})

export class ControlPanelComponent {
    public currentControl: string = 'calibration';

    constructor(
    ) { }

    public changeControls(event) {
        event.preventDefault();
        this.currentControl = event.currentTarget.getAttribute('data-control');
    }
}
