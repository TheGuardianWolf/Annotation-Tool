import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WorkspaceService } from '../../shared/workspace/workspace.service';
import { Person } from '../../shared/classes/storage';

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

interface IPaperTools {
    mouse: paper.Tool;
    boundingBox: paper.Tool;
    location: paper.Tool;
}

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

    private tools: IPaperTools = {
        'mouse': null,
        'boundingBox': null,
        'location': null
    };

    constructor(_ws: WorkspaceService) {
        this.ws = _ws;
    }

    private drawVisuals = (frameNumber: number, personIndex?: number) => {
        // Fill array with paper paths representing the bounding boxes of people in current frame
        let newVisuals: Array<IVisualAnnotation> = [];

        // Remove current visuals
        this.visualAnnotation.forEach((visual) => {
            visual.boundingBox.shape.remove();
            visual.location.shape.remove();
        });

        // Create new visuals
        let people = this.ws.annotation.data.frames[frameNumber].people;

        let createVisuals = (person: Person, index: number) => {
            let newVisualAnnotation: IVisualAnnotation;

            // Determine color based on index
            let color = new paper.Color({
                'hue': (10 * index) % 360,
                'saturation': 1,
                'brightness': 1
            });

            // Draw new visuals from annotation data
            if (person.boundingBox.isValid()) {
                this.layers.boundingBox.activate();
                newVisualAnnotation.boundingBox.shape = paper.Shape.Rectangle(
                    new paper.Point(person.boundingBox.top, person.boundingBox.left),
                    new paper.Point(person.boundingBox.bottom, person.boundingBox.right)
                )
                newVisualAnnotation.boundingBox.shape.strokeColor = color;
                newVisualAnnotation.boundingBox.shape.fillColor = color;
                newVisualAnnotation.boundingBox.shape.fillColor.alpha = 0.1;
            }
            
            if (person.location.virtual.isValid()) {
                this.layers.location.activate();
                newVisualAnnotation.location.shape = paper.Shape.Circle(
                    new paper.Point(person.location.virtual.x, person.location.virtual.y),
                    5
                )
                newVisualAnnotation.location.shape.fillColor = color;
                newVisualAnnotation.location.shape.fillColor.alpha = 0.7;
            }
            console.log(newVisualAnnotation);
            return newVisualAnnotation;
        }

        if (is.number(personIndex)) {
            let newPerson = people[personIndex]
            this.visualAnnotation[personIndex] = createVisuals(newPerson, personIndex);
        }
        else {
            this.visualAnnotation = people.map(createVisuals);
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
            'zoomPerClick': 1.8,
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

        // Bind the mouse event handlers to the OpenSeadragon tracker.
        new osd.MouseTracker({
            element: this.viewer.canvas,
            pressHandler: (event) => {
                callEventHandlers(event, 'click');
            },
            dragHandler: (event) => {
                callEventHandlers(event, 'drag');
            },
            dragEndHandler: (event) => {
                callEventHandlers(event, 'dragEnd');
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
            this.layers[key] = new paper.Layer();
        });
        this.layers.location.bringToFront();

        // Create the paper tools
        Object.keys(this.tools).forEach((key) => {
            this.tools[key] = new paper.Tool();
        });
        this.tools.mouse.activate();
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
                });
        }
    }

    public ngOnDestroy() {
        if (this.ws.initialised) {
            window.onresize = undefined;
        }
    }
}