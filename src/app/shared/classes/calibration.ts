import { IZone, Zone } from './zone';
import { IPoint, Point } from './storage';
import { IWorkspaceVars } from '../workspace/workspace.service';

import * as Q from 'q';
import * as path from 'path';
import * as fs from 'fs';

export interface IFlipOrigin {
    'x': boolean;
    'y': boolean;
}

export class Calibration {
    private _calibrated: boolean = false;
    get calibrated() {
        return this._calibrated;
    }

    private _lensCalibrationFile: string = '';
    get lensCalibrationFile() {
        return this._lensCalibrationFile;
    }
    set lensCalibrationFile(file) {
        if (file !== this._lensCalibrationFile) {
            this._lensCalibrationFile = file;
            this.checkCalibrated();
        }
    }

    private _perspectiveCalibrationFile: string = '';
    get perspectiveCalibrationFile() {
        return this._perspectiveCalibrationFile;
    }
    set perspectiveCalibrationFile(file) {
        if (file !== this._perspectiveCalibrationFile) {
            this._perspectiveCalibrationFile = file;
            this.checkCalibrated();
        }
    }

    private _zones: Array<Zone> = [];
    get zones() {
        return this._zones;
    }

    private _zoneFile: string = '';
    get zoneFile() {
        return this._zoneFile;
    }
    set zoneFile(file) {
        if (file !== this._zoneFile) {
            this._zoneFile = file;
            this.loadZones(this._zoneFile);
            this.checkCalibrated();
        }
    }

    private _imageOrigin: Point = new Point(null, null);
    get imageOrigin() {
        return this._imageOrigin;
    }
    set imageOrigin(point: Point) {
        this._imageOrigin = point;
        this.checkCalibrated();
    }
    get imageOriginX() {
        return this._imageOrigin.x;
    }
    get imageOriginY() {
        return this._imageOrigin.y;
    }
    set imageOriginX(coordinate: number) {
        this._imageOrigin.x = coordinate;
        this.checkCalibrated();
    }
    set imageOriginY(coordinate: number) {
        this._imageOrigin.y = coordinate;
        this.checkCalibrated();
    }

    public flipOrigin: IFlipOrigin = {
        'x': false,
        'y': false
    };

    public switchOrigin: boolean = false;

    private _roomSize: Point = new Point(null, null);

    get roomSize() {
        return this._roomSize;
    }
    set roomSize(size: Point) {
        this._roomSize = size;
        this.checkCalibrated();
    }
    get roomSizeX() {
        return this._roomSize.x;
    }
    get roomSizeY() {
        return this._roomSize.y;
    }
    set roomSizeX(coordinate: number) {
        this._roomSize.x = coordinate;
        this.checkCalibrated();
    }
    set roomSizeY(coordinate: number) {
        this._roomSize.y = coordinate;
        this.checkCalibrated();
    }

    constructor(vars?: IWorkspaceVars) {
        if (vars) {
            if (vars.lensCalibrationFile) this._lensCalibrationFile = vars.lensCalibrationFile;
            if (vars.perspectiveCalibrationFile) this._perspectiveCalibrationFile = vars.perspectiveCalibrationFile;
            if (vars.imageOrigin) this._imageOrigin = Point.parse(vars.imageOrigin);
            if (vars.flipOrigin) this.flipOrigin = vars.flipOrigin;
            if (vars.switchOrigin) this.switchOrigin = vars.switchOrigin;
            if (vars.roomSize) this.roomSize = Point.parse(vars.roomSize);
            if (vars.zoneFile) this.zoneFile = vars.zoneFile;

            this.checkCalibrated();
        }
    }

    private checkCalibrated(): boolean {
        let matchXML = /\.xml$/i;
        let matchJSON = /\.json$/i;
        this._calibrated = matchXML.test(this._lensCalibrationFile) &&
            matchXML.test(this._perspectiveCalibrationFile) &&
            matchJSON.test(this._zoneFile) &&
            this._imageOrigin.isValid() &&
            this._roomSize.isValid();
        
        return this._calibrated;
    }

    private loadZones = (zoneFile: string) => {
        // Load in the zones from config
        return Q.denodeify(fs.readFile)(zoneFile).then( (zones: string) => {
            this._zones = (JSON.parse(zones) as Array<IZone>).map((obj) => {
                return Zone.parse(obj);
            });
        },
        () => {
            this._zones = [];
        });
    }
}