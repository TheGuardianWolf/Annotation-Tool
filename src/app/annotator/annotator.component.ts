import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WorkspaceService } from '../shared/workspace/workspace.service';
import { Router } from '@angular/router';

/**
 * This class represents the lazy loaded AnnotatorComponent.
 */
@Component({
    selector: 'annotator',
    templateUrl: './annotator.component.html',
})

export class AnnotatorComponent implements OnInit, OnDestroy {
    private ws: WorkspaceService;
    private router: Router;

    constructor(_router: Router, _ws: WorkspaceService) {
        this.ws = _ws;
        this.router = _router;
    }

    private save() {
        this.ws.annotation.toFile(this.ws.workspaceDir).done();
    }

    public ngOnInit() {
        if (!this.ws.initialised) {
            this.router.navigate(['/hub', 'workspace']);
        }
    }

    public ngOnDestroy() {
        if (this.ws.initialised) {
            window.onresize = undefined;
        }
    }
}
