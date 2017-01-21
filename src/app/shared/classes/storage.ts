export class Point {
    public x: number;
    public y: number;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    isValid() {
        return typeof this.x === 'number' && typeof this.y === 'number';
    }

    toObject() {
        return {
            'x': this.x,
            'y': this.y
        };
    }
}

export class Person {
    public id: number;
    public obscured: boolean;
    public boundingBox: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    public location: {
        virtual: Point;
        real: Point;
        segment: String;
    };

    constructor(id, obscured, boundingBox, virtualPoint, realPoint, segment) {
        this.id = id;
        this.obscured = obscured;
        this.boundingBox = boundingBox;
        this.location = {
            'virtual': virtualPoint,
            'real': realPoint,
            'segment': segment
        };
    }

    toObject() {
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
                'segment': this.location.segment
            }
        };

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
            person.location.segment
        );
        return p;
    }
}

export class Frame {
    public frameNumber: number;
    public people: Array<Person>;

    constructor(frameNumber) {
        this.frameNumber = frameNumber;
        this.people = [];
    }

    addPerson(person) {
        this.people.push(person);
    }

    toObject() {
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
    public frames: Array<Frame>;

    constructor(number, name, increment, camera) {
        this.number = number;
        this.name = name;
        this.increment = increment;
        this.camera = camera;
        this.frames = [];
    }

    addFrame(frame, index?) {
        if (typeof index === 'number') {
            this.frames[index] = frame;
        }
        else {
            this.frames.push(frame);
        }
    }

    toObject() {
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