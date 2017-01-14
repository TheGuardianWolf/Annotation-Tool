import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotatorComponent } from './annotator.component';
import { AnnotatorRoutingModule } from './annotator-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [CommonModule, AnnotatorRoutingModule, SharedModule],
    declarations: [AnnotatorComponent],
    exports: [AnnotatorComponent],
    providers: []
})
export class AnnotatorModule { }
