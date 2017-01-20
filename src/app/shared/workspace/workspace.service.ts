import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Point, Person, Frame, Video } from './classes/storage';
import { PaperCanvas } from './classes/paper-canvas';
import { Calibration } from './classes/calibration';

/**
 * Backend state store for the workspace service
 */
class Workspace {    
    public paperCanvas: PaperCanvas;

    public imageList: Array<HTMLImageElement>

    public video: Video;

    public calibration: Calibration;

    constructor() {
    }
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

    loadWorkspace() { }

    createWorkspace() { }
}

