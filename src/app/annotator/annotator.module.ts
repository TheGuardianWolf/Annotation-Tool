import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotatorComponent } from './annotator.component';
import { AnnotatorRoutingModule } from './annotator.route';
import { SharedModule } from '../shared/shared.module';
import { ControlPanelModule } from './control-panel/control-panel.module';


@NgModule({
    imports: [CommonModule, AnnotatorRoutingModule, ControlPanelModule, SharedModule],
    declarations: [AnnotatorComponent],
    exports: [AnnotatorComponent],
    providers: []
})
export class AnnotatorModule { }
