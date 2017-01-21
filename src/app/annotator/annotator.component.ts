import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { WorkspaceService } from '../shared/workspace/workspace.service';

/**
 * This class represents the lazy loaded HubStartComponent.
 */
@Component({
    selector: 'Annotator',
    templateUrl: './annotator.component.html',
    //styleUrls: ['./annotator.component.scss'],
})

export class AnnotatorComponent implements OnInit {
    private _ws: WorkspaceService;

    constructor(_as: WorkspaceService) {
        this._ws = _as;
    }

    ngOnInit() {
        console.log('Annotator');
        if (!this._ws.workspace) {

        }
    }
}
