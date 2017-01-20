import { Point } from './storage';

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

    public _imageOrigin: Point;
    get imageOrigin() {
        return this._imageOrigin;
    }
    set imageOrigin(point) {
        this._imageOrigin = point;
        this.checkCalibrated;
    }

    public flipOrigin: Object = {
        'x': false,
        'y': false
    };

    public switchOrigin: boolean = false;

    public roomSize: Point = new Point(6000, 4000);

    constructor() {
    }

    public checkCalibrated(): boolean {
        let match = new RegExp('/\\.xml$/', 'i');
        this._calibrated = match.test(this._lensCalibrationFile) &&
            match.test(this._perspectiveCalibrationFile) &&
            this._imageOrigin.isValid();
        return this._calibrated;
    }
}