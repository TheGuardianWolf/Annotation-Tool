import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { FileElectronComponent } from './file-electron/file-electron.component';
import { MaterialCheckboxComponent } from './material-checkbox/material-checkbox.component';
import { WorkspaceService } from './workspace/workspace.service';
import { ImageToolService } from './image-tool/image-tool.service';
import { StatusService } from './status/status.service';

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
    imports: [CommonModule, RouterModule, FormsModule],
    declarations: [HeaderComponent, FileElectronComponent, MaterialCheckboxComponent],
    exports: [HeaderComponent, FileElectronComponent, MaterialCheckboxComponent,
        CommonModule, FormsModule, RouterModule]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [WorkspaceService, ImageToolService, StatusService]
        };
    }
}
