import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ControlPanelComponent } from './control-panel.component';

import { AnnotationControlComponent } from './controls/annotation-control.component';
import { CalibrationControlComponent } from './controls/calibration-control.component';
import { SettingsControlComponent } from './controls/settings-control.component';

@NgModule({
  imports: [
      RouterModule.forChild([
          { path: '', redirectTo: '/calibration', pathMatch: 'full', outlet: 'controls' },
          { path: 'annotation', component: AnnotationControlComponent, outlet: 'controls' },
          { path: 'calibration', component: CalibrationControlComponent, outlet: 'controls' },
          { path: 'settings', component: SettingsControlComponent, outlet: 'controls' }
    ])
  ],
  exports: [RouterModule]
})
export class ControlPanelRoutingModule { }
