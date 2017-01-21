import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HubStartComponent } from './hub-start.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: HubStartComponent }
    ])
  ],
  exports: [RouterModule]
})
export class HubStartRoutingModule { }
