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

    public isValid() {
        let validate = (n) => {
            return is.number(n) && n >= 0;
        }
        return validate(this.left) && validate(this.right) && validate(this.top) && validate(this.bottom);
    }

    static parse(boundingBox: IBoundingBox) {
        return new BoundingBox(
            boundingBox.left,
            boundingBox.right,
            boundingBox.top,
            boundingBox.bottom
        );
    }

    static interpolate(start: BoundingBox, stop: BoundingBox, deltas: number) {
        let output: Array<BoundingBox> = [];
        
        let startWidth = start.right - start.left;
        let startHeight = start.bottom - start.top;
        let startLocation = new Point(
            start.left + (startWidth / 2),
            start.top + (startHeight / 2)
        );

        let stopWidth = stop.right - stop.left;
        let stopHeight = stop.bottom - stop.top;
        let stopLocation = new Point(
            stop.left + (stopWidth / 2),
            stop.top + (stopHeight / 2)
        );
        let deltaWidth = (stopWidth - startWidth) / deltas;
        let deltaHeight = (stopHeight - startHeight) / deltas;
        let deltaLocation = new Point(
            (stopLocation.x - startLocation.x) / deltas,
            (stopLocation.y - startLocation.y) / deltas
        );

        for (let i = 1; i < deltas; i++) {
            let newLocation = new Point(
                startLocation.x + deltaLocation.x * i,
                startLocation.y + deltaLocation.y * i
            );

            let newWidth = startWidth + deltaWidth * i;
            let newHeight = startHeight + deltaHeight * i;

            let left = Math.floor(newLocation.x - newWidth / 2);
            let top = Math.floor(newLocation.y - newHeight / 2);
            let right = Math.floor(newLocation.x + newWidth / 2);
            let bottom = Math.floor(newLocation.y + newHeight / 2);

            output.push(new BoundingBox(left, right, top, bottom));
        }

        return output;
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
    public boundingBox: BoundingBox;
    public location: {
        virtual: Point;
        real: Point;
        zone: string;
    };
    public keyframe: boolean = false;

    constructor(
        id: number,
        obscured: boolean,
        boundingBox: BoundingBox,
        virtualPoint: Point,
        realPoint: Point,
        zone: string
    ) {
        this.id = id;
        this.obscured = obscured;
        this.boundingBox = boundingBox;
        this.location = {
            'virtual': virtualPoint,
            'real': realPoint,
            'zone': zone ? zone : ''
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
                'zone': null
            }
        };

        if (/^[A-D]$/.test(this.location.zone)) {
            person.location.zone = this.location.zone;
        }

        return person;
    }

    static parse(person) {
        let boundingBox = BoundingBox.parse({
            'left': person.box.topLeft.x,
            'right': person.box.bottomRight.x,
            'top': person.box.topLeft.y,
            'bottom': person.box.bottomRight.y
        });
        let p = new Person(
            person.id,
            person.obscured,
            boundingBox,
            new Point(person.location.virtual.x, person.location.virtual.y),
            new Point(person.location.real.x, person.location.real.y),
            ''
        );
        if (/^[A-D]$/.test(person.location.zone)) {
            p.location.zone = person.location.zone;
        }
        return p;
    }
}

export class Frame {
    public frameNumber: number;

    public people: Array<Person> = [];

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

    public frames: Array<Frame> = [];

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