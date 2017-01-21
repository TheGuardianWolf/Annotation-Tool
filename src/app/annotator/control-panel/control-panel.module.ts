import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPanelComponent } from './control-panel.component';
import { ControlPanelRoutingModule } from './control-panel.route';
import { SharedModule } from '../../shared/shared.module';
import { ControlsModule } from './controls/controls.module';

@NgModule({
    imports: [CommonModule, ControlPanelRoutingModule, ControlsModule, SharedModule],
    declarations: [ControlPanelComponent],
    exports: [ControlPanelComponent],
    providers: []
})
export class ControlPanelModule { }
