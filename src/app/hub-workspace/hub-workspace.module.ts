import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HubWorkspaceComponent } from './hub-workspace.component';
import { HubWorkspaceRoutingModule } from './hub-workspace-routing.module';
import { SharedModule } from '../shared/shared.module';

import { WorkspaceService } from '../shared/workspace/workspace.service';

@NgModule({
    imports: [CommonModule, FormsModule, HubWorkspaceRoutingModule, SharedModule],
    declarations: [HubWorkspaceComponent],
    exports: [HubWorkspaceComponent],
    providers: [WorkspaceService]
})
export class HubWorkspaceModule { }
