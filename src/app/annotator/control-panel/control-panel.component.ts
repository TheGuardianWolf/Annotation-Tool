import { Component } from '@angular/core';
import { WorkspaceService } from '../../shared/workspace/workspace.service';

/**
 * This class represents the lazy loaded ControlPanelComponent.
 */
@Component({
    selector: 'control-panel',
    templateUrl: './control-panel.component.html',
})

export class ControlPanelComponent {
    private ws;
    public currentControl: string = 'calibration';

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    public changeControls(event) {
        event.preventDefault();
        this.currentControl = event.currentTarget.getAttribute('data-control');
    }
}
