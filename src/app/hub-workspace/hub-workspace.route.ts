import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HubWorkspaceComponent } from './hub-workspace.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'hub/workspace', component: HubWorkspaceComponent }
    ])
  ],
  exports: [RouterModule]
})
export class HubWorkspaceRoutingModule { }
