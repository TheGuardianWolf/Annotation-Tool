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
    public annotation: Video = new Video(null, null, null, null);

    public calibration: Calibration = new Calibration();

    // Array of images from the workspace directory
    private _images: BehaviorSubject<Array<string>> = new BehaviorSubject([]);
    get imagesObs(): Observable<Array<string>> {
        return this._images.asObservable();
    }
    get images() {
        return this._images.value;
    }
    set images(value: Array<string>) {
        this._images.next(value);
    }
    get imagesCount() {
        return this._images.value.length;
    }

    // The current annotation frame
    private _currentFrame: BehaviorSubject<number> = new BehaviorSubject(null);
    get currentFrameObs() {
        return this._currentFrame.asObservable();
    }
    get currentFrame() {
        return this._currentFrame.value;
    }
    get currentFrameIndex() {
        return this.currentFrame - 1;
    }
    set currentFrame(value: number) {
        let index = value - 1;
        if (index >= 0 && index < this.imagesCount) {
            this._currentFrame.next(value)
        }
    }

    private _currentPerson: BehaviorSubject<number> = new BehaviorSubject(null);
    get currentPersoneObs() {
        return this._currentPerson.asObservable();
    }
    get currentPerson() {
        return this._currentPerson.value;
    }
    set currentPerson(value: number) {
        if (value >= 0 && this.currentFrameIndex && value < this.annotation.frames[this.currentFrameIndex].people.length) {
            this._currentPerson.next(value)
        }
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
                this.annotation = new Video(
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
                    'number': this.annotation.number,
                    'name': this.annotation.name
                },
                'video': {
                    'increment': this.annotation.increment,
                    'camera': this.annotation.camera
                },
                'lensCalibrationFile': this.calibration.lensCalibrationFile,
                'perspectiveCalibrationFile': this.calibration.perspectiveCalibrationFile,
                'imageOrigin': this.calibration.imageOrigin,
                'flipOrigin': this.calibration.flipOrigin,
                'switchOrigin': this.calibration.switchOrigin
            }, null, 4));
    }
}