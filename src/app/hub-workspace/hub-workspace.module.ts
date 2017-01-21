import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HubWorkspaceComponent } from './hub-workspace.component';
import { HubWorkspaceRoutingModule } from './hub-workspace.route';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, HubWorkspaceRoutingModule, SharedModule],
    declarations: [HubWorkspaceComponent],
    exports: [HubWorkspaceComponent],
    providers: []
})
export class HubWorkspaceModule { }
