//import { Observable } from 'rxjs/Observable';
//import { Subject } from 'rxjs/Subject';
//import { BehaviorSubject } from 'rxjs/Rx';

import { Point, Person, Frame, Video } from './storage';
import { Canvas } from './canvas';
import { Calibration } from './calibration';

/**
 * Backend state store for the workspace service
 */
export class Workspace {
    private _busy: boolean = false;
    get busy() {
        return this._busy;
    }

    public canvas: Canvas = new Canvas();

    public imageList: Array<HTMLImageElement> = [];

    public video: Video;

    public calibration: Calibration = new Calibration();

    constructor() {
    }
}