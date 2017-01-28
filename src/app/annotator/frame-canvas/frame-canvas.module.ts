import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FrameCanvasComponent } from './frame-canvas.component';


@NgModule({
    imports: [CommonModule, SharedModule],
    declarations: [FrameCanvasComponent],
    exports: [FrameCanvasComponent],
    providers: []
})
export class FrameCanvasModule { }
