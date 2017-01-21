import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as ChildProcess from 'child_process';
import * as path from 'path';
import * as Q from 'q';

/**
 * This class provides the shared camera-tool interface so that it can be initialised and used in the annotator.
 */
@Injectable()
export class CameraToolService {
    private cameraToolPath: string = 'build/native/CameraTool'

    constructor() {

    }

    extractImages(src, dst): Q.Promise<{}> {
        let cmd = [this.cameraToolPath, '-E', src, dst];
        return Q.denodeify(ChildProcess.exec)(path.join(__dirname, '..', cmd.join(' ')))
    }

    getRealCoordinates(
        point,
        origin,
        lCalibFile, pCalibFile,
        callback
    ): Q.Promise<{}> {
        let cmd = [
            this.cameraToolPath,
            '-Ip',
            point.x, point.y,
            origin.x, origin.y,
            lCalibFile, pCalibFile
        ];
        return Q.denodeify(ChildProcess.exec)(path.join(process.cwd(), cmd.join(' '))).then((data) => {
            return JSON.parse(data as string);
        });
    }
}

