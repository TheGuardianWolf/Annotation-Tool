import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
const $ = require('jquery');

interface ICreate {
    directory: string;
    videoFile: string;
    annotationFile?: string;
}

interface ILoad {
    directory: string;
    annotationFile?: string;
}

/**
 * This class represents the lazy loaded HubWorkspaceComponent.
 */
@Component({
    selector: 'HubWorkspace',
    templateUrl: './hub-workspace.component.html',
    //styleUrls: ['./hub-start.component.scss'],
})

export class HubWorkspaceComponent implements OnInit {
    public create: ICreate = {
        directory: '',
        videoFile: '',
        annotationFile: null
    };
    public load: ILoad = {
        directory: '',
        annotationFile: null
    };

    constructor(
    ) {
    }

    ngOnInit() {
        console.log('HubWorkspace');
        $.material.init();
    }

    createWorkspace() {
        console.log('Creating a workspace');
    }

    loadWorkspace() {
        console.log('Loading a workspace');
    }
}
