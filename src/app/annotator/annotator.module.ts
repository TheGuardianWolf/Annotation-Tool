import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotatorComponent } from './annotator.component';
import { AnnotatorRoutingModule } from './annotator-routing.module';
import { SharedModule } from '../shared/shared.module';

import { WorkspaceService } from '../shared/workspace/workspace.service';
import { CameraToolService } from '../shared/camera-tool/camera-tool.service';

@NgModule({
    imports: [CommonModule, AnnotatorRoutingModule, SharedModule],
    declarations: [AnnotatorComponent],
    exports: [AnnotatorComponent],
    providers: [WorkspaceService, CameraToolService]
})
export class AnnotatorModule { }
