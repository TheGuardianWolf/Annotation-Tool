import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlPanelComponent } from './control-panel.component';
import { SharedModule } from '../../shared/shared.module';

import { AnnotationControlComponent } from './annotation-control/annotation-control.component';
import { CalibrationControlComponent } from './calibration-control/calibration-control.component';
import { SettingsControlComponent } from './settings-control/settings-control.component';

@NgModule({
    imports: [CommonModule, SharedModule, FormsModule],
    declarations: [ControlPanelComponent, AnnotationControlComponent, CalibrationControlComponent, SettingsControlComponent],
    exports: [ControlPanelComponent],
    providers: []
})
export class ControlPanelModule { }
