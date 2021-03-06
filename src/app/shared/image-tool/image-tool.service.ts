﻿import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IPoint } from '../classes/storage';

import * as fs from 'fs';
import * as ChildProcess from 'child_process';
import * as path from 'path';
import * as Q from 'q';

/**
 * This class provides the shared camera-tool interface so that it can be initialised and used in the annotator.
 */
@Injectable()
export class ImageToolService {
    private cameraToolPath: string = path.join(__dirname, 'native', 'CameraTool');

    constructor() {
    }

    public extractImages(src: string, dst: string) {
        return Q.denodeify(ChildProcess.execFile)(
            this.cameraToolPath,
            [
                '-E',
                src,
                dst
            ]
        );
    }

    public readImageDir(src: string) {
        return Q.denodeify(fs.readdir)(path.normalize(src)).then((files) => {
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
        point: IPoint,
        origin: IPoint,
        lCalibFile: string, pCalibFile: string
    ) {
        return Q.denodeify(ChildProcess.execFile)(
            this.cameraToolPath,
            [
                '-Ip',
                point.x.toString(), point.y.toString(),
                origin.x.toString(), origin.y.toString(),
                path.normalize(lCalibFile), path.normalize(pCalibFile)
            ]
        ).then((data) => {
            return JSON.parse((data as Array<string>)[0]) as IPoint;
        });
    }
}
