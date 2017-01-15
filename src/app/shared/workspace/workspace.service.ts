import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Point, Person, Frame, Video, Sequence, Annotation } from './storage/storage';
import { PaperCanvas } from './paper-canvas/paper-canvas';
import { Calibration } from './calibration/calibration';

/**
 * Backend state store for the workspace service
 */
class Workspace {    
    public paperCanvas: PaperCanvas;

    public imageList: Array<HTMLImageElement>

    public annotation: Annotation;

    public sequence: Sequence;

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
    public busy: Observable<boolean>;

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

