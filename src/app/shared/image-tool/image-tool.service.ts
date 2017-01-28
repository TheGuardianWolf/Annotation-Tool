import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Point } from '../classes/storage';

import * as fs from 'fs';
import * as ChildProcess from 'child_process';
import * as path from 'path';
import * as Q from 'q';

/**
 * This class provides the shared camera-tool interface so that it can be initialised and used in the annotator.
 */
@Injectable()
export class ImageToolService {
    private cameraToolPath: string = path.join('native', 'CameraTool');

    constructor() {

    }

    public extractImages(src: string, dst: string) {
        let cmd = [this.cameraToolPath, '-E', src, dst];
        return Q.denodeify(ChildProcess.exec)(path.join(__dirname, cmd.join(' ')))
    }

    public readImageDir(src: string) {
        return Q.denodeify(fs.readdir)(src).then((files) => {
            return (files as Array<string>).filter((file) => {
                let parts = file.split('.');
                return parts[parts.length - 1] === 'jpg' && parseInt(parts[0]) >= 0;
            })
                .sort((a, b) => {
                    let i = parseInt(a.split('.')[0]);
                    let j = parseInt(b.split('.')[0]);
                    return i - j;
                });
        });
    }

    public getRealCoordinates(
        point: Point,
        origin: Point,
        lCalibFile: string, pCalibFile: string
    ) {
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

