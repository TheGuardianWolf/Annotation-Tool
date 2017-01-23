import { Injectable, OnInit } from '@angular/core';
import { Workspace } from '../classes/workspace';
import { Video } from '../classes/storage';
import { ImageToolService } from '../image-tool/image-tool.service';

import * as Q from 'q';
import * as path from 'path';

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
    private its: ImageToolService;

    private _busy: boolean;
    private _busyChain: Q.Promise<any>;
    get busy() {
        return this._busy || this.workspace.busy;
    }

    private chainBusy(promises: Array<Q.Promise<any>>) {
        this._busy = true;

        let setBusy = () => {
            this._busy = true;
        }

        let setFree = () => {
            this._busy = false;
        }

        if (!this._busyChain || this._busyChain.isFulfilled) {
            if (this._busyChain) {
                this._busyChain.done();
            }
            this._busyChain = Q.allSettled([...promises])
                .then(setFree);
        }
        else {
            this._busyChain
                .then(setBusy).done();
            this._busyChain = Q.allSettled<Q.Promise<any>>([...promises, this._busyChain])
                .then(setFree);
        }
    }

    private _initialised: boolean = false;
    get initialised() {
        return this._initialised;
    }

    // Workspace reference
    public workspace: Workspace = new Workspace();

    // Inputs
    public videoFile: string;
    public annotationFile: string;
    public workspaceDir: string;

    constructor(its: ImageToolService) {
        this.its = its;
    }

    private getVideoContext() {
        let videoBasename = path.basename(this.videoFile, '.mkv').split('_');
        let sequenceNumber = parseInt(videoBasename[0].substr(-1));
        let sequenceName = videoBasename[1];
        let videoIncrement = videoBasename[2];
        let videoCamera = parseInt(videoBasename[3].substr(-1));

        this.workspace.videoAnnotation = new Video(
            sequenceNumber,
            sequenceName,
            videoIncrement,
            videoCamera
        );
    }

    public init(config: IWorkspaceConfig): Q.Promise<{}> {
        this.workspaceDir = config.directory;
        this.videoFile = config.video;
        this.annotationFile = config.annotation;

        // Reload the workspace and get context
        this.workspace = new Workspace();
        this.getVideoContext();

        let initWorkspace = (filenames) => {
            this.workspace.canvas.loadTileSources(
                this.workspaceDir,
                filenames as Array<string>
            );
            // TODO: Find a way to pass HTML5 Canvas into this method.
            this.workspace.canvas.init();
        }

        let promiseChain;

        if (this.videoFile) {
            this.workspace.toFile(path.join(this.workspaceDir, 'workspace.json'));

            // If there's a video file, extract the images and read in image paths
            promiseChain = this.its.extractImages(this.videoFile, this.workspaceDir)
                .then(() => {
                    return this.its.readImageDir(this.workspaceDir);
                })
                .then(initWorkspace);
        }
        else {
            // Otherwise just read in image paths and the workspace file
            promiseChain = Q.all([
                this.its.readImageDir(this.workspaceDir)
                .then(initWorkspace).done(),
                this.workspace.fromFile(path.join(this.workspaceDir, 'workspace.json'))
            ]);
        }

        // Put this promise chain into the busy chain
        this.chainBusy([promiseChain]);

        this._initialised = true;

        return promiseChain;
    }

    public save() {
        if (!this._busy) {
        }
    }
}

