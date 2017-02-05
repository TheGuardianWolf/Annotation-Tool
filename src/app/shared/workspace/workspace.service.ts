import { Injectable } from '@angular/core';
import { ImageToolService } from '../image-tool/image-tool.service';
import { StatusService } from '../status/status.service';

import { Annotation } from '../classes/annotation';
import { IPoint, Point, BoundingBox, Person, Frame, Video } from '../classes/storage';
import { Calibration, IFlipOrigin } from '../classes/calibration';
import { Settings } from '../classes/settings';

import * as Q from 'q';
import * as path from 'path';
import * as fs from 'fs';

export interface IWorkspaceConfig {
    directory: string;
    video?: string;
    annotation?: string;
}

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
 * This class provides the shared workspace interface so that it can be initialised and used in the annotator
 */
@Injectable()
export class WorkspaceService {
    private its: ImageToolService;
    private ss: StatusService;

    public annotation: Annotation = new Annotation();

    public calibration: Calibration = new Calibration();

    public settings: Settings = new Settings();

    private _initialised: boolean = false;
    get initialised() {
        return this._initialised;
    }

    private lastAnnotatedFrame = null;

    // Inputs
    public videoFile: string;
    public annotationFile: string;
    public workspaceDir: string;

    constructor(_its: ImageToolService, _ss: StatusService) {
        this.ss = _ss;
        this.its = _its;
    }

    private getVideoContext() {
        let videoBasename = path.basename(this.videoFile, '.mkv').split('_');
        let sequenceNumber = parseInt(videoBasename[0].substr(-1));
        let sequenceName = videoBasename[1];
        let videoIncrement = videoBasename[2];
        let videoCamera = parseInt(videoBasename[3].substr(-1));

        this.annotation.data.number = sequenceNumber;
        this.annotation.data.name = sequenceName;
        this.annotation.data.increment = videoIncrement;
        this.annotation.data.camera = videoCamera;
    }

    public init(config: IWorkspaceConfig): Q.Promise<{}> {
        this.workspaceDir = config.directory;
        this.videoFile = config.video;
        this.annotationFile = config.annotation;

        // Load fresh annotation
        this.annotation = new Annotation();

        let promiseChain: Q.Promise<any>;

        let setAnnotationImages = (images) => {
            this.annotation.images = images;
        };

        let fillAnnotationFrames = () => {
            for (let i = this.annotation.data.frames.length; i < this.annotation.imagesCount; i++) {
                let newFrame = new Frame(i + 1);
                this.annotation.data.addFrame(newFrame);
            }
        }

        let getVideoAnnotations = (workspaceVars?: IWorkspaceVars) => {
            let deferred = Q.defer();
            if (this.annotationFile) {
                this.annotation.fromFile(this.annotationFile, workspaceVars).then(
                    () => {
                        deferred.resolve();
                    },
                    (err) => {
                        deferred.reject(err);
                    }
                );
            }
            else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        if (this.videoFile) {
            // Get context from input video
            this.getVideoContext();

            // Write workspace
            this.toFile(path.join(this.workspaceDir, 'workspace.json'));

            // If there's a video file, extract the images and read in image paths
            promiseChain = Q.all([
                this.its.extractImages(this.videoFile, this.workspaceDir)
                    .then(() => {
                        return this.its.readImageDir(this.workspaceDir);
                    })
                    .then(setAnnotationImages),
                getVideoAnnotations()
            ]);
        }
        else {
            // Otherwise just read in image paths and the workspace file
            promiseChain = Q.all([
                this.its.readImageDir(this.workspaceDir)
                    .then(setAnnotationImages),
                this.fromFile(path.join(this.workspaceDir, 'workspace.json'))
                    .then(getVideoAnnotations)
            ]);
        }

        promiseChain.then(fillAnnotationFrames);

        this.annotation.beforeChangeFrame.push(
            // Copies current frame annotations to next frame
            () => {
                if ((this.settings.copyBox === true || this.settings.copyLocation === true) && this.settings.mode === 'mixed') {
                    let index = this.annotation.currentFrameIndex;
                    let currentPerson = this.annotation.currentPerson;
                    if (index >= 0 && index + 1 < this.annotation.data.frames.length) {
                        let people = this.annotation.data.frames[index].people;
                        let nextPeople = this.annotation.data.frames[index + 1].people;

                        if (people[currentPerson]) {
                            let nextPerson = nextPeople.filter((person) => {
                                return person.id === people[currentPerson].id;
                            });

                            if (nextPerson.length === 0) {
                                nextPerson = [Person.parse(people[currentPerson].toObject())];
                                this.annotation.data.frames[index + 1].addPerson(nextPerson[0]);
                            }

                            // Required else JS makes reference to the objects in the previous person.
                            let currentPersonCopy = Person.parse(people[currentPerson].toObject());

                            if (this.settings.copyBox === true && people[currentPerson].boundingBox) {
                                nextPerson.forEach((person) => {
                                    if (!person.boundingBox) {
                                        person.boundingBox = currentPersonCopy.boundingBox;
                                    }
                                });
                            }

                            if (this.settings.copyLocation === true && people[currentPerson].location) {
                                nextPerson.forEach((person) => {
                                    if (!person.location) {
                                        person.location = currentPersonCopy.location;
                                    }
                                });
                            }
                        }
                    }
                }
            }
        )

        this._initialised = true;

        return promiseChain;
    }

    public interpolateToCurrent() {
        let deltas = 0;
        let replaceIndex;
        let start;
        let currentFrameIndex = this.annotation.currentFrameIndex;
        let currentPerson = this.annotation.currentPerson;

        let end = this.annotation.data.frames[currentFrameIndex].people[currentPerson].boundingBox;
        for (let i = currentFrameIndex - 1; i >= 0; i--) {
            deltas++;
            let person = this.annotation.data.frames[i].people[currentPerson];
            if (person && person.keyframe) {
                start = person.boundingBox;
                replaceIndex = i + 1;
                deltas = currentFrameIndex - i;
                break;
            }
        }

        if (start && end && start.isValid && end.isValid()) {
            let autoBox = BoundingBox.interpolate(start, end, deltas);
            autoBox.forEach((newBox, newBoxIndex) => {
                let replace = replaceIndex + newBoxIndex;
                if (this.annotation.data.frames[replace].people) {
                    let test = this.annotation.data.frames[replace].people[currentPerson];
                    if (test && !test.keyframe) {
                        test.boundingBox = newBox;
                    }
                }
            });
        }
    }

    public autoCoordinateCurrent() {
        let location = this.annotation.data.frames[this.annotation.currentFrameIndex].people[this.annotation.currentPerson].location;
        this.its.getRealCoordinates(
            location.virtual,
            this.calibration.imageOrigin,
            this.calibration.lensCalibrationFile,
            this.calibration.perspectiveCalibrationFile,
        )
            .done((realPosition) => {
                // TODO: Fix bug somewhere here
                let locationX;
                let locationY;
                if (!this.calibration.switchOrigin) {
                    locationX = this.calibration.flipOrigin.x ?
                        this.calibration.roomSize.x - realPosition.x : realPosition.x;
                    locationY = this.calibration.flipOrigin.y ?
                        this.calibration.roomSize.y - realPosition.y : realPosition.y;
                }
                else {
                    locationY = this.calibration.flipOrigin.x ?
                        this.calibration.roomSize.y - realPosition.x : realPosition.x;
                    locationX = this.calibration.flipOrigin.y ?
                        this.calibration.roomSize.x - realPosition.y : realPosition.y;
                }

                if (locationX >= 0 && locationY >= 0 && locationX <= 1500 && locationY <= 1700) {
                    location.segment = 'A';
                }
                else if (locationX <= 3600 && locationY <= 1700) {
                    location.segment = 'C';
                }
                else if (locationX <= 3600 && locationY <= 4000) {
                    location.segment = 'B';
                }
                else if (locationX <= 6000 && locationY <= 4000) {
                    location.segment = 'D';
                }
                else {
                    location.segment = 'N/A';
                }

                location.real = new Point(Math.round(locationX), Math.round(locationY));
            });
    }

    public fromFile(file) {
        return Q.denodeify(fs.readFile)(file).then(
            (file) => {
                let workspaceVars: IWorkspaceVars = JSON.parse(file as string);
                this.calibration = new Calibration(workspaceVars);
                this.annotation.data.number = workspaceVars.sequence.number;
                this.annotation.data.name = workspaceVars.sequence.name;
                this.annotation.data.increment = workspaceVars.video.increment;
                this.annotation.data.camera = workspaceVars.video.camera;
                return workspaceVars;
            }
        );
    }

    public toFile(file) {
        return Q.denodeify(fs.writeFile)(
            file,
            JSON.stringify({
                'sequence': {
                    'number': this.annotation.data.number,
                    'name': this.annotation.data.name
                },
                'video': {
                    'increment': this.annotation.data.increment,
                    'camera': this.annotation.data.camera
                },
                'lensCalibrationFile': this.calibration.lensCalibrationFile,
                'perspectiveCalibrationFile': this.calibration.perspectiveCalibrationFile,
                'imageOrigin': this.calibration.imageOrigin,
                'flipOrigin': this.calibration.flipOrigin,
                'switchOrigin': this.calibration.switchOrigin
            }, null, 4));
    }
}

