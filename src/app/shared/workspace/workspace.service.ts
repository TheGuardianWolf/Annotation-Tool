import { Injectable } from '@angular/core';
import { ImageToolService } from '../image-tool/image-tool.service';
import { StatusService } from '../status/status.service';

import { Annotation } from '../classes/annotation';
import { IPoint, Point, Person, Frame, Video } from '../classes/storage';
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

        let promiseChain;

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
            ]).done(fillAnnotationFrames);
        }
        else {
            // Otherwise just read in image paths and the workspace file
            promiseChain = Q.all([
                this.its.readImageDir(this.workspaceDir)
                    .then(setAnnotationImages),
                this.fromFile(path.join(this.workspaceDir, 'workspace.json'))
                    .then(getVideoAnnotations)
            ]).then(fillAnnotationFrames);
        }

        // Set status to blocking

        this._initialised = true;

        return promiseChain;
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

