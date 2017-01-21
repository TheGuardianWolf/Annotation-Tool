import { Injectable, OnInit } from '@angular/core';
import { Workspace } from '../classes/workspace';
import { CameraToolService } from '../camera-tool/camera-tool.service';

import * as Q from 'q';

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
    private _busy: boolean;
    get busy() {
        return this._busy || this.workspace.busy;
    }

    private _initialised: boolean = false;
    get initialised() {
        return this._initialised;
    }

    private cts: CameraToolService;

    // Workspace reference
    public workspace: Workspace = new Workspace();

    // Inputs
    public videoFile: string;
    public annotationFile: string;
    public workspaceDir: string;

    constructor(_cts: CameraToolService) {
        this.cts = _cts;
    }

    init(config: IWorkspaceConfig) {
        this.workspaceDir = config.directory;
        this.videoFile = config.video;
        this.annotationFile = config.annotation;

        if (this.videoFile) {
            this._busy = true;
            this.cts.extractImages(this.videoFile, this.workspaceDir)
                .then(() => {
                })
        }
        this._initialised = true;
    }

    loadImages(): Q.Promise<{}> {

    }

    save() {
        if (!this._busy) {
        }
    }
}

