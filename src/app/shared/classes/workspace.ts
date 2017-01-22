//import { Observable } from 'rxjs/Observable';
//import { Subject } from 'rxjs/Subject';
//import { BehaviorSubject } from 'rxjs/Rx';

import * as path from 'path';
import * as fs from 'fs';
import * as Q from 'q';

import { Point, Person, Frame, Video } from './storage';
import { Canvas } from './canvas';
import { Calibration, IFlipOrigin } from './calibration';

export interface IWorkspaceVars {
    'sequence': {
        'number': number;
        'name': string;
    };
    'video': {
        'increment': string;
        'camera': number;
    };
    'lensCalibrationFile': string;
    'perspectiveCalibrationFile': string;
    'imageOrigin': Point;
    'flipOrigin': IFlipOrigin;
    'switchOrigin': boolean;
}

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

    public videoAnnotation: Video = new Video(null, null, null, null);

    public calibration: Calibration = new Calibration();

    constructor() {
    }

    public loadImageFiles(dir: string, filenames: Array<string>) {
        let imageList = [];
        filenames.forEach((filename) => {
            let newImage = new Image();
            newImage.src = path.join(dir, filename);

            imageList.push(newImage);
        });
        this.imageList = imageList;
    }

    public selectImageOrigin() {
    };

    public fromFile(file) {
        return Q.denodeify(fs.readFile)(file).then(
            (file) => {
                let workspaceVars: IWorkspaceVars = JSON.parse(file as string);
                this.calibration = new Calibration(workspaceVars);
            }
        );
    }

    public toFile(file) {
        return Q.denodeify(fs.writeFile)(
            file,
            JSON.stringify({
            'sequence': {
                'number': this.videoAnnotation.number,
                'name': this.videoAnnotation.name
            },
            'video': {
                'increment': this.videoAnnotation.increment,
                'camera': this.videoAnnotation.camera
            },
            'lensCalibrationFile': this.calibration.lensCalibrationFile,
            'perspectiveCalibrationFile': this.calibration.perspectiveCalibrationFile,
            'imageOrigin': this.calibration.imageOrigin,
            'flipOrigin': this.calibration.flipOrigin,
            'switchOrigin': this.calibration.switchOrigin
        }, null, 4));
    }
}