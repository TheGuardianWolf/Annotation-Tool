import { Point, Person, Frame, Video } from './storage';
import { Canvas } from './canvas';
import { Calibration } from './calibration';

/**
 * Backend state store for the workspace service
 */
export class Workspace {
    public canvas: Canvas;

    public imageList: Array<HTMLImageElement>

    public video: Video;

    public calibration: Calibration;

    constructor() {
    }
}