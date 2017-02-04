import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WorkspaceService } from '../../shared/workspace/workspace.service';
import { Person, Point } from '../../shared/classes/storage';

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

interface IVisualAnnotation {
    boundingBox: paper.Shape;
    location: paper.Shape;
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

    private visualAnnotation: Array<IVisualAnnotation> = [];

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

    private createBoundingBox(rectangle: paper.Shape, index: number) {
        // Determine color based on index
        let color = new paper.Color({
            'hue': ((180 * index) + 10 * index) % 360,
            'saturation': 1,
            'brightness': 1
        });

        this.layers.boundingBox.activate();
        let boundingBox = rectangle;
        boundingBox.name = `bbx-${index}`;
        boundingBox.strokeColor = color;
        boundingBox.strokeScaling = false;
        boundingBox.fillColor = color;
        boundingBox.fillColor.alpha = 0.1;

        return boundingBox;
    }

    private createLocationCircle(circle: paper.Shape, index: number) {
        // Determine color based on index
        let color = new paper.Color({
            'hue': ((180 * index) + 10 * index) % 360,
            'saturation': 1,
            'brightness': 1
        });

        this.layers.location.activate();
        let location = circle;
        location.name = `loc-${index}`;
        location.fillColor = color;
        location.fillColor.alpha = 0.7;
        return location;
    }

    private drawVisuals = (frameNumber: number, personIndex?: number) => {
        let frameIndex = frameNumber - 1;
        // Fill array with paper paths representing the bounding boxes of people in current frame
        let newVisuals: Array<IVisualAnnotation> = [];

        let removeVisual = (visual: IVisualAnnotation, index?: number) => {
            if (visual) {
                if (visual.boundingBox) {
                    if (visual.boundingBox) {
                        visual.boundingBox.remove();
                    }
                }

                if (visual.location) {
                    if (visual.location) {
                        visual.location.remove();
                    }
                }
            }
        }

        // Create new visuals
        let people = this.ws.annotation.data.frames[frameIndex].people;

        let createVisual = (person: Person, index: number) => {
            let newVisualAnnotation: IVisualAnnotation = {
                'boundingBox': null,
                'location': null
            };

            // Draw new visuals from annotation data
            if (person.boundingBox.isValid()) {
                newVisualAnnotation.boundingBox = this.createBoundingBox(paper.Shape.Rectangle(
                    new paper.Point(person.boundingBox.left, person.boundingBox.top),
                    new paper.Point(person.boundingBox.right, person.boundingBox.bottom)
                ), index);
            }
            if (person.location.virtual.isValid()) {
                newVisualAnnotation.boundingBox = this.createLocationCircle(paper.Shape.Circle(
                    new paper.Point(person.location.virtual.x, person.location.virtual.y),
                    5
                ), index);
            }
            return newVisualAnnotation;
        }

        if (is.number(personIndex)) {
            let newPerson = people[personIndex];
            removeVisual(this.visualAnnotation[personIndex]);
            this.visualAnnotation[personIndex] = createVisual(newPerson, personIndex);
        }
        else {
            this.visualAnnotation.forEach(removeVisual);
            this.visualAnnotation = people.map(createVisual);
        }

        this.ws.annotation.redrawVisuals = false;
        this.selectPerson(this.ws.annotation.currentPerson);
    }

    private selectPerson(personIndex: number) {
        if (
            this.visualAnnotation[personIndex] &&
            this.visualAnnotation[personIndex].boundingBox
        ) {
            this.visualAnnotation.filter((visual) => {
                return visual.boundingBox.selected === true;
            })
                .forEach((visual) => {
                    visual.boundingBox.selected = false;
                });
            this.visualAnnotation[personIndex].boundingBox.selected = true;
        }
    }

    private pushVisualData(personIndex: number) {
        let visual = this.visualAnnotation[personIndex];
        let personData = this.ws.annotation.data.frames[this.ws.annotation.currentFrameIndex].people[personIndex];

        if (visual && personData) {
            if (visual.boundingBox) {
                let shapeBounds = visual.boundingBox.bounds;
                Object.keys(personData.boundingBox).forEach((key) => {
                    if (shapeBounds[key] && personData.boundingBox[key] !== shapeBounds[key]) {
                        personData.boundingBox[key] = Math.floor(shapeBounds[key]);
                    }
                });
            }

            if (visual.location) {
                let shapeLocation = visual.boundingBox.position;
                Object.keys(personData.location.virtual).forEach((key) => {
                    if (shapeLocation[key] && personData.location.virtual[key] !== shapeLocation[key]) {
                        personData.location.virtual[key] = Math.floor(shapeLocation[key]);
                    }
                });
            }
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
                        'url': this.images[index].src,
                        'buildPyramid': false
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
            'visibilityRatio': 0.8,
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
                'bounds': true,
                'stroke': false,
                'segments': false,
                'handles': false
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
                if (modEvent.hitTest) {
                    this._viewer.setMouseNavEnabled(false);
                }
                callEventHandlers(modEvent, 'mouseDown');
            },
            releaseHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'mouseUp');
                this._viewer.setMouseNavEnabled(true);
            },
            dragHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'drag');
                paper.view.draw();
            },
            dragEndHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'dragEnd');
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
    }

    private bindEvents() {
        let pointToPixel = (point: paper.Point) => {
            let newPoint = new paper.Point(
                Math.floor(point.x),
                Math.floor(point.y)
            );
            return newPoint;
        }

        let itemInsideImage = (item: paper.Item) => {
            return item.isInside(new paper.Rectangle(
                new paper.Point(0, 0), new paper.Size(
                    this.images[this.ws.annotation.currentFrameIndex].naturalWidth + 1,
                    this.images[this.ws.annotation.currentFrameIndex].naturalHeight + 1
                )
            ));
        }

        let pointInsideImage = (point: paper.Point) => {
            let imageSpace = new paper.Rectangle(
                new paper.Point(0, 0), new paper.Size(
                    this.images[this.ws.annotation.currentFrameIndex].naturalWidth + 1,
                    this.images[this.ws.annotation.currentFrameIndex].naturalHeight + 1
                )
            )
            return imageSpace.contains(point);
        }

        // Previous frame
        this.on('keyDown', 'z', (event) => {
            this.ws.annotation.currentFrame--;
        });

        // Next frame
        this.on('keyDown', 'x', (event) => {
            this.ws.annotation.currentFrame++;
        });

        // Pointer
        this.on('keyDown', 'e', (event) => {
            if (this.ws.settings.mode === 'mixed') {
                this.ws.settings.tool = 'pointer';
            }
        });

        // Box drawer
        this.on('keyDown', 'r', (event) => {
            if (this.ws.settings.mode === 'mixed') {
                this.ws.settings.tool = 'box';
            }
        });

        // Location marker
        this.on('keyDown', 't', (event) => {
            if (this.ws.settings.mode === 'mixed') {
                this.ws.settings.tool = 'location';
            }
        });

        // Mixed mode
        this.on('keyDown', '1', (event) => {
            this.ws.settings.mode = 'mixed';
        });

        // Location mode
        this.on('keyDown', '2', (event) => {
            this.ws.settings.mode = 'location';
        });

        // Interpolate bounding box from keyframes
        this.on('keyDown', 'd', (event) => {
            // TODO: Interpolate
        });

        // Report mouse position
        this.on('move', 'mousePosition', (event) => {
            this.mousePosition = pointToPixel(event.point);
        })

        // Select paper objects
        this.on('click', 'mixed.pointer.click', (event) => {
            if (this.ws.settings.mode === 'mixed' && this.ws.settings.tool === 'pointer') {
                if (event.hitTest && event.hitTest.item) {
                    let hitTest = event.hitTest as paper.HitResult;

                    let itemName = event.hitTest.item.name.split('-');
                    let selectedPersonIndex = parseInt(itemName[1]);

                    if (itemName[0] === 'bbx') {
                        this.ws.annotation.currentPerson = selectedPersonIndex;
                    }
                }
            }
        });

        this.on('click', 'mixed.location.click', (event) => {
            if (this.ws.settings.mode === 'mixed' && this.ws.settings.tool === 'location') {
                let locationPoint = new paper.Point(event.position.x, event.position.y);
                if (pointInsideImage(locationPoint)) {
                    let currentPerson = this.ws.annotation.currentPerson;
                    if (!this.visualAnnotation[currentPerson].location) {
                        this.visualAnnotation[currentPerson].location = this.createLocationCircle(paper.Shape.Circle(
                            locationPoint,
                            5
                        ), currentPerson);
                    }
                    else {
                        this.visualAnnotation[currentPerson].location.position = locationPoint;
                    }
                    this.pushVisualData(currentPerson);
                    // TODO: Calculate real position
                }
                this.ws.settings.tool = 'pointer';
            }
        });

        this.on('click', 'location.location.click', (event) => {
            if (this.ws.settings.mode === 'mixed' && this.ws.settings.tool === 'location') {
                let locationPoint = new paper.Point(event.position.x, event.position.y);
                if (pointInsideImage(locationPoint)) {
                    let currentPerson = this.ws.annotation.currentPerson;
                    if (!this.visualAnnotation[currentPerson].location) {
                        this.visualAnnotation[currentPerson].location = this.createLocationCircle(paper.Shape.Circle(
                            locationPoint,
                            5
                        ), currentPerson);
                    }
                    else {
                        this.visualAnnotation[currentPerson].location.position = locationPoint;
                    }
                    this.pushVisualData(currentPerson);
                    // TODO: Calculate real position
                    this.ws.annotation.currentFrame++;
                }
            }
        });

        let originalHitTest: paper.HitResult = null;

        // Drag paper objects
        this.on('drag', 'mixed.pointer.drag', (event) => {
            if (this.ws.settings.mode === 'mixed' && this.ws.settings.tool === 'pointer') {
                let hitTest: paper.HitResult = null;
                if (originalHitTest && originalHitTest.item) {
                    hitTest = originalHitTest;
                }
                else if (event.hitTest && event.hitTest.item) {
                    hitTest = event.hitTest as paper.HitResult;
                    originalHitTest = hitTest;
                }

                if (hitTest) {
                    let itemName = hitTest.item.name.split('-');
                    let selectedPersonIndex = parseInt(itemName[1]);

                    if (itemName[0] === 'bbx') {
                        let delta = (paper.view.viewToProject(
                            new paper.Point(event.delta.x, event.delta.y)
                        ) as any)
                            .subtract(paper.view.viewToProject(
                                new paper.Point(0, 0)
                            ));

                        if (hitTest.type === 'fill' || !hitTest.item.selected) {
                            let oldPosition = new paper.Point(hitTest.item.position);
                            hitTest.item.position = new paper.Point(
                                hitTest.item.position.x + delta.x,
                                hitTest.item.position.y + delta.y
                            );
                            if (!itemInsideImage(hitTest.item)) {
                                hitTest.item.position = oldPosition;
                            }
                        }
                        else if (hitTest.type === 'bounds') {
                            let nameArray = hitTest.name.split('-');
                            nameArray[1] = nameArray[1].charAt(0).toUpperCase() + nameArray[1].slice(1);
                            let name = nameArray.join('');

                            let oldPosition = new paper.Point(hitTest.item.bounds[name]);
                            hitTest.item.bounds[name] = new paper.Point(
                                hitTest.item.bounds[name].x + delta.x,
                                hitTest.item.bounds[name].y + delta.y
                            );

                            if (!itemInsideImage(hitTest.item)) {
                                hitTest.item.bounds[name] = oldPosition;
                            }
                        }

                        this.ws.annotation.currentPerson = selectedPersonIndex;
                        this.pushVisualData(selectedPersonIndex);
                    }
                }
            }
        });

        this.on('drag', 'mixed.box.drag', (event) => {
            if (this.ws.settings.mode === 'mixed' && this.ws.settings.tool === 'box') {
                // TODO: Implement box creation via drag
            }
        });

        // After dragging paper objects
        this.on('dragEnd', 'mixed.pointer.dragEnd', (event) => {
            if (this.ws.settings.mode === 'mixed' && this.ws.settings.tool === 'pointer') {
                originalHitTest = null;
            }
        });
    }

    private loadImages(dir: string, filenames: Array<string>): Q.Promise<{}> {
        let promises: Array<Q.Promise<{}>> = [];
        multiqueue.create('cacheTiles', 18);

        this.images = filenames.map((filename, index) => {
            // Set up deferred object to represent the 'image loaded' event
            let deferred: Q.Deferred<{}> = Q.defer();
            promises.push(deferred.promise);

            let image = new Image();
            let imageSrc = image.src = path.join(dir, filename);

            let cacheTile = () => {
                this.tileCache[index] = new osd.ImageTileSource({
                    'url': imageSrc,
                    'buildPyramid': false
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