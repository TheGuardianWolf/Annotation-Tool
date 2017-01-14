import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HubStartModule } from './hub-start/hub-start.module';
import { HubWorkspaceModule } from './hub-workspace/hub-workspace.module';
import { AnnotatorModule } from './annotator/annotator.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        AppRoutingModule,
        HubStartModule,
        HubWorkspaceModule,
        AnnotatorModule,
        SharedModule.forRoot()
    ],
    declarations: [AppComponent],
    providers: [],
    bootstrap: [AppComponent]

})
export class AppModule { }