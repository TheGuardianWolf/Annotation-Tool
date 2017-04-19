import { IPoint, Point } from './storage';

export interface IZone {
    label: string;
    area: Array<IPoint>;
}

export class Zone implements IZone {
    public label: string;
    public area: Array<Point>;

    constructor(label: string, area : Array<IPoint>) {
        this.label = label;
        this.area = area.map((point) => {
            return Point.parse(point);
        });
    }

    public contains(point: IPoint) {
        return (point.x >= this.area[0].x && point.x < this.area[2].x &&
        point.y >= this.area[1].y && point.y < this.area[2].y);
    }

    static parse(zone: IZone) {
        return new Zone(zone.label, zone.area);
    }
}
