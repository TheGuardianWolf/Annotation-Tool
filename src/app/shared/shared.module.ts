import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { FileElectronComponent } from './file-electron/file-electron.component';

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [HeaderComponent, FileElectronComponent],
  exports: [HeaderComponent, FileElectronComponent,
    CommonModule, FormsModule, RouterModule]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
