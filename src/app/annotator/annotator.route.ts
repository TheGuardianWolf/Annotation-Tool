import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnnotatorComponent } from './annotator.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'annotator', component: AnnotatorComponent }
    ])
  ],
  exports: [RouterModule]
})
export class AnnotatorRoutingModule { }
