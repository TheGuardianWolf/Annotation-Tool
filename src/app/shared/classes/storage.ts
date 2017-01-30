import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/Rx';

import * as is from 'is';

export interface IPoint {
    x: number;
    y: number;
}

export interface IBoundingBox {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export class BoundingBox implements IBoundingBox {
    public left: number;
    public right: number;
    public top: number;
    public bottom: number;

    constructor(left: number, right: number, top: number, bottom: number) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }

    static parse(boundingBox: IBoundingBox) {
    }
}

export class Point implements IPoint {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public isValid() {
        return is.number(this.x) && is.number(this.y);
    }

    public toObject() {
        return {
            'x': this.x,
            'y': this.y
        };
    }

    static parse(point: IPoint) {
        return new Point(point.x, point.y);
    }
}

export class Person {
    public id: number;
    public obscured: boolean;
    public boundingBox: IBoundingBox;
    public location: {
        virtual: Point;
        real: Point;
        segment: String;
    };

    constructor(
        id: number,
        obscured: boolean,
        boundingBox: IBoundingBox,
        virtualPoint: Point,
        realPoint: Point,
        segment: String
    ) {
        this.id = id;
        this.obscured = obscured;
        this.boundingBox = boundingBox;
        this.location = {
            'virtual': virtualPoint,
            'real': realPoint,
            'segment': segment
        };
    }

    public toObject() {
        let person = {
            'id': this.id,
            'obscured': this.obscured,
            'box': {
                'topLeft': new Point(this.boundingBox.left, this.boundingBox.top).toObject(),
                'topRight': new Point(this.boundingBox.right, this.boundingBox.top).toObject(),
                'bottomLeft': new Point(this.boundingBox.left, this.boundingBox.bottom).toObject(),
                'bottomRight': new Point(this.boundingBox.right, this.boundingBox.bottom).toObject()
            },
            'location': {
                'virtual': this.location.virtual.toObject(),
                'real': this.location.real.toObject(),
                'segment': null
            }
        };
        if (person.location.segment === 'A' ||
            person.location.segment === 'B' ||
            person.location.segment === 'C' ||
            person.location.segment === 'D') {
            person.location.segment = this.location.segment;
        }

        return person;
    }

    static parse(person) {
        let boundingBox = {
            'left': person.box.topLeft.x,
            'right': person.box.bottomRight.x,
            'top': person.box.topLeft.y,
            'bottom': person.box.bottomRight.y
        }
        let p = new Person(
            person.id,
            person.obscured,
            boundingBox,
            new Point(person.location.virtual.x, person.location.virtual.y),
            new Point(person.location.real.x, person.location.real.y),
            ''
        );
        if (p.location.segment === 'A' ||
            p.location.segment === 'B' ||
            p.location.segment === 'C' ||
            p.location.segment === 'D') {
            p.location.segment = person.location.segment;
        }
        return p;
    }
}

export class Frame {
    public frameNumber: number;
    public keyframe: boolean = false;

    private _people: BehaviorSubject<Array<Person>> = new BehaviorSubject([]);
    get peopleObs(): Observable<Array<Person>> {
        return this._people.asObservable();
    }
    get people() {
        return this._people.value;
    }
    set people(value: Array<Person>) {
        this._people.next(value);
    }

    constructor(frameNumber: number) {
        this.frameNumber = frameNumber;
    }

    public addPerson(person: Person) {
        let newPeople = this.people;
        newPeople.push(person);
        this.people = newPeople;
    }

    public toObject() {
        return {
            'frameNumber': this.frameNumber,
            'numberOfPeople': this.people.length,
            'people': this.people.map((person) => {
                return person.toObject();
            })
        };
    }

    static parse(frame) {
        let f = new Frame(frame.frameNumber);
        frame.people.forEach((person) => {
            if (person) {
                f.addPerson(Person.parse(person));
            }
        });
        return f;
    }
}

export class Video {
    public number: number;
    public name: string;
    public increment: string;
    public camera: number;

    private _frames: BehaviorSubject<Array<Frame>> = new BehaviorSubject([]);
    get framesObs(): Observable<Array<Frame>> {
        return this._frames.asObservable();
    }
    get frames() {
        return this._frames.value;
    }
    set frames(value: Array<Frame>) {
        this._frames.next(value);
    }

    constructor(number: number, name: string, increment: string, camera: number) {
        this.number = number;
        this.name = name;
        this.increment = increment;
        this.camera = camera;
    }

    public addFrame(frame: Frame, index?: number) {
        if (is.number(index)) {
            let newFrames = this.frames;
            newFrames[index] = frame;
            this.frames = newFrames;
        }
        else {
            let newFrames = this.frames;
            newFrames.push(frame);
            this.frames = newFrames;
        }
    }

    public toObject() {
        return {
            'number': this.number,
            'name': this.name,
            'increment': this.increment,
            'camera': this.camera,
            'frames': this.frames.map((frame) => {
                return frame.toObject();
            })
        };
    }

    public toJSON() {
        return JSON.stringify(this.toObject())
    }

    static parse(video) {
        let v = new Video(video.number, video.name, video.increment, video.camera);
        video.frames.forEach((frame) => {
            if (frame) {
                v.addFrame(Frame.parse(frame));
            }
        });
        return v;
    }
}