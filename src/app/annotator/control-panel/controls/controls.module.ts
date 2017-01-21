import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';

import { AnnotationControlComponent } from './annotation-control/annotation-control.component';
import { CalibrationControlComponent } from './calibration-control/calibration-control.component';
import { SettingsControlComponent } from './settings-control/settings-control.component';

@NgModule({
    imports: [CommonModule, SharedModule],
    declarations: [AnnotationControlComponent, CalibrationControlComponent, SettingsControlComponent],
    exports: [AnnotationControlComponent, CalibrationControlComponent, SettingsControlComponent],
    providers: []
})
export class ControlsModule { }
