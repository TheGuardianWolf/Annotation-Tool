import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { WorkspaceService } from '../shared/workspace/workspace.service';
import { Router } from '@angular/router';

/**
 * This class represents the lazy loaded HubStartComponent.
 */
@Component({
    selector: 'Annotator',
    templateUrl: './annotator.component.html',
    //styleUrls: ['./annotator.component.scss'],
})

export class AnnotatorComponent implements OnInit {
    private ws: WorkspaceService;
    private router: Router;

    constructor(_router: Router, _ws: WorkspaceService) {
        this.ws = _ws;
        this.router = _router;
    }

    ngOnInit() {
        if (!this.ws.initialised) {
            this.router.navigate(['/hub', 'workspace']);
        }
    }
}
