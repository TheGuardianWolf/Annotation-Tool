import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/Rx';
import { remote } from 'electron';

import * as Q from 'q';
import * as fs from 'fs';

import { IPoint, Point, Person, Frame, Video } from './storage';
import { IWorkspaceVars } from '../workspace/workspace.service';

export class Annotation {

    private _data: Video = new Video(null, null, null, null);
    get data() {
        return this._data;
    }

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
        if (this._currentFrame.value !== value) {

            let index = value - 1;

            if (index >= 0 && index < this.imagesCount) {
                this._currentFrame.next(value)
            }
        }
    }

    private _redrawVisuals: BehaviorSubject<boolean> = new BehaviorSubject(false);
    get redrawVisualsObs() {
        return this._redrawVisuals.asObservable();
    }
    get redrawVisuals() {
        return this._redrawVisuals.value;
    }
    set redrawVisuals(value) {
        if (value !== this._redrawVisuals.value) {
            this._redrawVisuals.next(value);
        }
    }

    private _currentPerson: BehaviorSubject<number> = new BehaviorSubject(null);
    get currentPersonObs() {
        return this._currentPerson.asObservable();
    }
    get currentPerson() {
        // Verify that the current person index does not exceed people array size for current frame
        if (this._currentPerson.value >= this._data.frames[this.currentFrameIndex].people.length) {
            this._currentPerson.next(this._data.frames[this.currentFrameIndex].people.length - 1);
        }
        // Verify that the current person index is 0 or higher if there is a person in frame.
        else if ((this._currentPerson.value <= 0 || is.not.number(this._currentPerson.value)) && this._data.frames[this.currentFrameIndex].people.length > 0) {
            this._currentPerson.next(0);
        }
        return this._currentPerson.value;
    }
    set currentPerson(value: number) {
        if (
            value >= 0 &&
            this._currentPerson.value !== value &&
            this._currentFrame.value && value < this._data.frames[this.currentFrameIndex].people.length
        ) {
            this._currentPerson.next(value)
        }
    }

    get currentPersonObject() {
        return this.currentFrame[this.currentPerson];
    }

    constructor() {
    }

    public fromFile(file, match?: IWorkspaceVars) {
        return Q.denodeify(fs.readFile)(file).then(
            (contents) => {
                let newData = Video.parse(JSON.parse(contents as string));

                // If match is provided, new data must match.
                if (match) {
                    if (match.sequence.number === newData.number &&
                        match.sequence.name === newData.name &&
                        match.video.increment === newData.increment &&
                        match.video.camera === newData.camera) {
                        this._data = newData;
                    }
                }
                else {
                    this._data = newData;
                }
            }
        );
    }

    public toFile(file: string, defaultPath?: string) {
        let saveOptions: any = {
            'title': 'Save annotation file'
        };
        if (defaultPath) saveOptions.defaultPath = defaultPath;
        return Q.denodeify(fs.writeFile)(
            remote.dialog.showSaveDialog(saveOptions),
            JSON.stringify(this.data, null, 4)
        );
    }
}