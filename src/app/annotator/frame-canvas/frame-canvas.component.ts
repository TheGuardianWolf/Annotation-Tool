import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WorkspaceService } from '../../shared/workspace/workspace.service';
import { Person } from '../../shared/classes/storage';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/Rx';

import * as path from 'path';
import * as Q from 'q';
import * as is from 'is';
import * as noUiSlider from 'nouislider';
import * as paper from 'paper';

const osd = require('openseadragon');
const multiqueue = require('multiqueue');

interface IEventHandlers {
    click: Object;
    drag: Object;
    dragEnd: Object;
    move: Object;
    mouseDown: Object;
    mouseUp: Object;
    keyDown: Object;
    keyUp: Object;
}

//interface IPaperTools {
//    mouse: paper.Tool;
//    boundingBox: paper.Tool;
//    location: paper.Tool;
//    active: string;
//}

interface IPaperLayers {
    boundingBox: paper.Layer;
    location: paper.Layer;
}

interface IPaperShape {
    shape: paper.Shape;
    subscription: any;
}

interface IVisualAnnotation {
    boundingBox: IPaperShape;
    location: IPaperShape;
}

/**
 * This class represents the lazy loaded FrameCanvasComponent.
 */
@Component({
    selector: 'frame-canvas',
    templateUrl: './frame-canvas.component.html'
})

export class FrameCanvasComponent implements OnInit, OnDestroy {
    @ViewChild('osdBinding') osdBinding: ElementRef;
    private ws: WorkspaceService;

    private images: Array<HTMLImageElement> = [];
    get imagesCount() {
        return this.images.length;
    }

    private tileCache: Array<any> = [];

    private _viewer;
    get viewer() {
        return this._viewer;
    }

    private _overlay;
    get overlay() {
        return this._overlay;
    }

    private mousePosition: paper.Point = new paper.Point(0, 0);

    private _visualAnnotation: BehaviorSubject<Array<IVisualAnnotation>> = new BehaviorSubject([]);

    get visualAnnotationObs(): Observable<Array<IVisualAnnotation>> {
        return this._visualAnnotation.asObservable();
    }
    get visualAnnotation() {
        return this._visualAnnotation.value;
    }
    set visualAnnotation(value: Array<IVisualAnnotation>) {
        if (value !== this._visualAnnotation.value) {
            this._visualAnnotation.next(value);
        }
    }

    private layers: IPaperLayers = {
        'boundingBox': null,
        'location': null
    };

    private eventHandlers: IEventHandlers = {
        'click': {},
        'drag': {},
        'dragEnd': {},
        'move': {},
        'mouseDown': {},
        'mouseUp': {},
        'keyDown': {},
        'keyUp': {}
    }

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    private frameNavigatorChange(event) {
        this.ws.annotation.currentFrame = parseInt(event.target.value);
    }

    private drawVisuals = (frameNumber: number, personIndex?: number) => {
        let frameIndex = frameNumber - 1;
        // Fill array with paper paths representing the bounding boxes of people in current frame
        let newVisuals: Array<IVisualAnnotation> = [];

        // Remove current visuals
        this.visualAnnotation.forEach((visual) => {
            if (visual.boundingBox) {
                if (visual.boundingBox && visual.boundingBox.shape) {
                    visual.boundingBox.shape.remove();
                }
                if (visual.boundingBox.subscription) {
                    visual.boundingBox.subscription.unsubscribe();
                }
            }

            if (visual.location) {
                if (visual.location.shape) {
                    visual.location.shape.remove();
                }
                if (visual.location.subscription) {
                    visual.location.subscription.unsubscribe();
                }
            }
        });

        // Create new visuals
        let people = this.ws.annotation.data.frames[frameIndex].people;

        let createVisuals = (person: Person, index: number) => {
            let newVisualAnnotation: IVisualAnnotation = {
                'boundingBox': null,
                'location': null
            };

            // Determine color based on index
            let color = new paper.Color({
                'hue': (10 * index) % 360,
                'saturation': 1,
                'brightness': 1
            });

            // Draw new visuals from annotation data
            if (person.boundingBox.isValid()) {
                this.layers.boundingBox.activate();
                let boundingBox: IPaperShape = {
                    'shape': paper.Shape.Rectangle(
                        new paper.Point(person.boundingBox.left, person.boundingBox.top),
                        new paper.Point(person.boundingBox.right, person.boundingBox.bottom)
                    ),
                    'subscription': null // TODO: Implement subscriptions to person.
                };
                boundingBox.shape.name = `bbx-${index}`;
                boundingBox.shape.strokeColor = color;
                boundingBox.shape.fillColor = color;
                boundingBox.shape.fillColor.alpha = 0.1;
                newVisualAnnotation.boundingBox = boundingBox;
            }
            if (person.location.virtual.isValid()) {
                this.layers.location.activate();
                let location: IPaperShape = {
                    'shape': paper.Shape.Circle(
                        new paper.Point(person.location.virtual.x, person.location.virtual.y),
                        5
                    ),
                    'subscription': null
                };
                location.shape.name = `loc-${index}`;
                location.shape.fillColor = color;
                location.shape.fillColor.alpha = 0.7;
                newVisualAnnotation.location = location;
            }
            return newVisualAnnotation;
        }

        if (is.number(personIndex)) {
            let newPerson = people[personIndex]
            this.visualAnnotation[personIndex] = createVisuals(newPerson, personIndex);
        }
        else {
            this.visualAnnotation = people.map(createVisuals);
        }

        this.ws.annotation.redrawVisuals = false;
        this.selectPerson(this.ws.annotation.currentPerson);
    }

    private selectPerson(personIndex: number) {
        if (
            this.visualAnnotation[personIndex] &&
            this.visualAnnotation[personIndex].boundingBox &&
            this.visualAnnotation[personIndex].boundingBox.shape
        ) {
            this.visualAnnotation[personIndex].boundingBox.shape.selected = true;
        }
    }

    public changeFrame = (frameNumber: number) => {
        // frameNumber must be valid to change to the frame
        if (is.number(frameNumber)) {
            let index = frameNumber - 1;

            // Load the tile from cache or create it
            if (this.tileCache[index]) {
                this.viewer.open(this.tileCache[index]);
            }
            else {
                this.viewer.open(
                    new osd.ImageTileSource({
                        'url': this.images[index].src
                    })
                );
            }

            this.drawVisuals(frameNumber);
        }
    }

    public on(event: string, name: string, handler: Function) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event][name] = handler;
        }
    }

    public off(event: string, name: string, handler: Function) {
        if (this.eventHandlers[event] && this.eventHandlers[event][name]) {
            delete this.eventHandlers[event][name];
        }
    }

    @HostListener('document:keydown', ['$event'])
    private keyDownBinding(event: KeyboardEvent) {
        let handler = this.eventHandlers.keyDown[event.key];
        if (is.function(handler)) {
            handler(event);
        }
    }

    @HostListener('document:keyup', ['$event'])
    private keyUpBinding(event: KeyboardEvent) {
        let handler = this.eventHandlers.keyUp[event.key];
        if (is.function(handler)) {
            handler(event);
        }
    }

    private bindCanvas() {
        this._viewer = osd({
            'element': this.osdBinding.nativeElement,
            'prefixUrl': "assets/osd-icons/images/",
            'debugMode': false,
            'visibilityRatio': 0.95,
            'constrainDuringPan': true,
            'showNavigator': true,
            'zoomPerScroll': 1.3,
            'zoomPerClick': 1,
            'preserveViewport': true,
            'minZoomImageRatio': 0.8,
            'maxZoomPixelRatio': 2.5,
        });
        this._overlay = this.viewer.paperjsOverlay();

        let callEventHandlers = (event, eventName) => {
            Object.keys(this.eventHandlers[eventName]).forEach(
                (key) => {
                    if (is.function(this.eventHandlers[eventName][key])) {
                        this.eventHandlers[eventName][key](event);
                    }
                }
            )
        }

        let performHitTest = (event) => {
            let imagePoint = paper.view.viewToProject(new paper.Point(event.position.x, event.position.y));
            let hitTest = paper.project.hitTest(imagePoint, {
                'tolerance': 5,
                'fill': true,
                'bounds': true
            });
            event.hitTest = hitTest;
            return event;
        }

        // Bind the mouse event handlers to the OpenSeadragon tracker.
        new osd.MouseTracker({
            element: this.viewer.canvas,
            clickHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'click');
            },
            pressHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'mouseDown');
            },
            releaseHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'mouseUp');
            },
            dragHandler: (event) => {
                let modEvent = performHitTest(event);
                if (modEvent.hitTest) {
                    this._viewer.setMouseNavEnabled(false);
                }
                callEventHandlers(modEvent, 'drag');
            },
            dragEndHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'dragEnd');
                this._viewer.setMouseNavEnabled(true);
            }
        }).setTracking(true);

        // Bind mousemove event handlers
        paper.view.on('mousemove', (event) => {
            callEventHandlers(event, 'move');
        });

        // Set canvas to dynamically resize on window resize
        let dynamicResizeCanvas = () => {
            this._overlay.resize();
            this._overlay.resizecanvas();
        };

        window.onresize = dynamicResizeCanvas;

        // Create the paper layers
        Object.keys(this.layers).forEach((key) => {
            this.layers[key] = new paper.Layer({
                'name': key
            });
        });
        this.layers.location.bringToFront();

        // Create the paper tools
        //Object.keys(this.tools).forEach((key) => {
        //    this.tools[key] = new paper.Tool();
        //});
        //this.tools.mouse.activate();
    }

    private bindEvents() {
        let pointToPixel = (point: paper.Point) => {
            let newPoint = new paper.Point(
                Math.floor(point.x),
                Math.floor(point.y)
            );
            return newPoint;
        }

        // Previous frame
        this.on('keyDown', 'z', (event) => {
            this.ws.annotation.currentFrame--;
        });

        // Next frame
        this.on('keyDown', 'x', (event) => {
            this.ws.annotation.currentFrame++;
        });

        // Report mouse position
        this.on('move', 'mousePosition', (event) => {
            this.mousePosition = pointToPixel(event.point);
        })

        // Select paper objects
        this.on('click', 'mouseClick', (event) => {
            if (this.ws.settings.annotationMode === 'mixed') {
                if (event.hitTest && event.hitTest.item) {
                    let itemName = event.hitTest.item.name.split('-');
                    if (itemName[0] === 'bbx') {
                        let selectedPersonIndex = parseInt(itemName[1]);
                        this.ws.annotation.currentPerson = selectedPersonIndex;
                    }
                }
                console.log(event.hitTest);
            }
            else if (this.ws.settings.annotationMode === 'location') {
                this.ws.annotation.currentFrame++;
            }
        });
    }

    private loadImages(dir: string, filenames: Array<string>): Q.Promise<{}> {
        let promises: Array<Q.Promise<{}>> = [];
        multiqueue.create('cacheTiles', 17);

        this.images = filenames.map((filename, index) => {
            // Set up deferred object to represent the 'image loaded' event
            let deferred: Q.Deferred<{}> = Q.defer();
            promises.push(deferred.promise);

            let image = new Image();
            let imageSrc = image.src = path.join(dir, filename);

            let cacheTile = () => {
                this.tileCache[index] = new osd.ImageTileSource({
                    'url': imageSrc
                })
            };

            image.onload = () => {
                deferred.resolve(image.src);
                multiqueue.add(
                    cacheTile,
                    (data) => {
                    },
                    'cacheTiles'
                );
            };
            image.onerror = (err) => {
                deferred.reject(err);
            }

            // Add image to imageSrc array
            image.src = imageSrc;
            return image;
        });

        return Q.all(promises);
    }

    public ngOnInit() {
        if (this.ws.initialised) {
            this.bindCanvas();
            this.bindEvents();

            let imagesLoaded: Q.Promise<{}>;

            this.ws.annotation.imagesObs.subscribe(
                (imageList) => {
                    imagesLoaded = this.loadImages(this.ws.workspaceDir, imageList);
                    imagesLoaded.done(() => {
                        if (!this.ws.annotation.currentFrame) {
                            this.ws.annotation.currentFrame = 1;
                        }
                    });
                }
            );

            this.ws.annotation.currentFrameObs.subscribe(
                (frameNumber) => {
                    this.changeFrame(frameNumber);
                }
            );

            this.ws.annotation.currentPersonObs.subscribe(
                (index) => {
                    this.selectPerson(index);
                }
            );

            //this.visualAnnotationObs.subscribe(
            //    (visuals) => {
            //        if (this.ws.annotation.currentPerson) {
            //            let visual = visuals[this.ws.annotation.currentPerson];
            //            let personData = this.ws.annotation.data.frames[this.ws.annotation.currentFrame].people[this.ws.annotation.currentPerson];

            //            if (visual.boundingBox) {
            //                let shapeBounds = visual.boundingBox.shape.bounds;
            //                Object.keys(personData.boundingBox).forEach((key) => {
            //                    if (shapeBounds[key] && personData.boundingBox[key] !== shapeBounds[key]) {
            //                        personData.boundingBox[key] = shapeBounds[key];
            //                    }
            //                });
            //            }

            //            if (visual.location) {
            //                let shapeLocation = visual.boundingBox.shape.position;
            //                Object.keys(personData.location.virtual).forEach((key) => {
            //                    if (shapeLocation[key] && personData.location.virtual[key] !== shapeLocation[key]) {
            //                        personData.location.virtual[key] = shapeLocation[key];
            //                    }
            //                });
            //            }
            //        }
            //    }
            //);

            this.ws.annotation.redrawVisualsObs.filter(
                (value) => {
                    return value === true;
                }
            )
                .subscribe((value) => {
                    this.drawVisuals(this.ws.annotation.currentFrame, this.ws.annotation.currentPerson);
                });
        }
    }

    public ngOnDestroy() {
        if (this.ws.initialised) {
            window.onresize = undefined;
        }
    }
}