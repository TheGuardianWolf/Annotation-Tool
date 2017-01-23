import { Point } from './storage';
import { IWorkspaceVars } from './workspace';

export interface IFlipOrigin {
    'x': boolean;
    'y': boolean;
}

export class Calibration {
    private _calibrated: boolean = false;
    get calibrated() {
        return this._calibrated;
    }

    private _lensCalibrationFile: string;
    get lensCalibrationFile() {
        return this._lensCalibrationFile;
    }
    set lensCalibrationFile(file) {
        if (file !== this._lensCalibrationFile) {
            this._lensCalibrationFile = file;
            this.checkCalibrated();
        }
    }

    private _perspectiveCalibrationFile: string;
    get perspectiveCalibrationFile() {
        return this._perspectiveCalibrationFile;
    }
    set perspectiveCalibrationFile(file) {
        if (file !== this._perspectiveCalibrationFile) {
            this._perspectiveCalibrationFile = file;
            this.checkCalibrated();
        }
    }

    private _imageOrigin: Point = new Point(null, null);
    set imageOrigin(point) {
        this._imageOrigin = point;
        this.checkCalibrated();
    }
    get imageOriginX() {
        return this._imageOrigin.x;
    }
    get imageOriginY() {
        return this._imageOrigin.y;
    }
    set imageOriginX(coordinate) {
        this._imageOrigin.x = coordinate;
        this.checkCalibrated();
    }
    set imageOriginY(coordinate) {
        this._imageOrigin.y = coordinate;
        this.checkCalibrated();
    }

    public flipOrigin: IFlipOrigin = {
        'x': false,
        'y': false
    };

    public switchOrigin: boolean = false;

    public roomSize: Point = new Point(6000, 4000);

    constructor(vars?: IWorkspaceVars) {
        if (vars) {
            if (vars.lensCalibrationFile) this._lensCalibrationFile = vars.lensCalibrationFile;
            if (vars.perspectiveCalibrationFile) this._perspectiveCalibrationFile = vars.perspectiveCalibrationFile;
            if (vars.imageOrigin) this._imageOrigin = Point.parse(vars.imageOrigin);
            if (vars.flipOrigin) this.flipOrigin = vars.flipOrigin;
            if (vars.switchOrigin) this.switchOrigin = vars.switchOrigin;

            this.checkCalibrated();
        }        
    }

    private checkCalibrated(): boolean {
        let match = /\.xml$/i;
        this._calibrated = match.test(this._lensCalibrationFile) &&
            match.test(this._perspectiveCalibrationFile) &&
            this._imageOrigin.isValid();
        
        return this._calibrated;
    }
}