import { Injectable, OnInit } from '@angular/core';
import { Workspace } from '../classes/workspace';
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

    private getVideoContext(filename: string) {

    }

    public init(config: IWorkspaceConfig) {
        this.workspace = new Workspace();

        this.workspaceDir = config.directory;
        this.videoFile = config.video;
        this.annotationFile = config.annotation;

        let loadImageFiles = (filenames) => {
            this.workspace.loadImageFiles(this.workspaceDir, filenames as Array<string>);
        }

        let promiseChain;

        if (this.videoFile) {
            // this.workspace.saveToFile(path.join(this.workspaceDir, 'workspace.json'));

            // If there's a video file, extract the images and read in image paths
            promiseChain = this.its.extractImages(this.videoFile, this.workspaceDir)
                .then(() => {
                    return this.its.readImageDir(this.workspaceDir);
                })
                .then(loadImageFiles);
        }
        else {
            // Otherwise just read in image paths and the workspace file
            promiseChain = Q.all([
                this.its.readImageDir(this.workspaceDir)
                .then(loadImageFiles).done(),
                this.workspace.fromFile(path.join(this.workspaceDir, 'workspace.json').done())
            ]);
        }

        // Put this promise chain into the busy chain
        this.chainBusy([promiseChain]);

        this._initialised = true;
    }

    public save() {
        if (!this._busy) {
        }
    }
}

