import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HubStartComponent } from './hub-start.component';
import { HubStartRoutingModule } from './hub-start-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, HubStartRoutingModule, SharedModule],
  declarations: [HubStartComponent],
  exports: [HubStartComponent],
  providers: []
})
export class HubStartModule { }
