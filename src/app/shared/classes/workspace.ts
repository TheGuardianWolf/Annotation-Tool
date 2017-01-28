import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/Rx';

import * as path from 'path';
import * as fs from 'fs';
import * as Q from 'q';

import { IPoint, Point, Person, Frame, Video } from './storage';
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
    'imageOrigin': IPoint;
    'flipOrigin': IFlipOrigin;
    'switchOrigin': boolean;
}

/**
 * Backend state store for the workspace service
 */
export class Workspace {
    public videoAnnotation: Video = new Video(null, null, null, null);

    public calibration: Calibration = new Calibration();

    private _images: BehaviorSubject<Array<string>> = new BehaviorSubject([]);
    get images(): Observable<Array<string>> {
        return this._images.asObservable();
    }
    public setImages(value: Array<string>) {
        this._images.next(value);
    }

    constructor() {
    }

    public selectImageOrigin() {
    };

    public fromFile(file) {
        return Q.denodeify(fs.readFile)(file).then(
            (file) => {
                let workspaceVars: IWorkspaceVars = JSON.parse(file as string);
                this.calibration = new Calibration(workspaceVars);
                this.videoAnnotation = new Video(
                    workspaceVars.sequence.number,
                    workspaceVars.sequence.name,
                    workspaceVars.video.increment,
                    workspaceVars.video.camera
                );
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