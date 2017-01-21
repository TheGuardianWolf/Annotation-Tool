import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Workspace } from './classes/workspace';

export interface IWorkspaceConfig {
    directory: string;
    video?: string;
    annotation?: string;
}

/**
 * This class provides the shared workspace interface so that it can be initialised and used in the annotator
 */
@Injectable()
export class WorkspaceService {
    private _busy: Observable<boolean>;
    get busy() {
        return this._busy;
    }

    // Workspace reference
    public workspace: Workspace;

    // Inputs
    public videoFile: string;
    public annotationFile: string;
    public workspaceDir: string;

    constructor() { }

    init(config: IWorkspaceConfig) {
        this.workspaceDir = config.directory;
        this.videoFile = config.video;
        this.annotationFile = config.annotation;

        console.log(this.workspaceDir, this.videoFile, this.annotationFile);

        this.workspace = new Workspace();
    }
}

