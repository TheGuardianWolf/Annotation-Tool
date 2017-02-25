import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WorkspaceService } from '../../shared/workspace/workspace.service';
import { ImageToolService } from '../../shared/image-tool/image-tool.service';
import { Person, Point, IPoint, BoundingBox } from '../../shared/classes/storage';
import { Loader } from '../../shared/classes/loader';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/Rx';

import * as path from 'path';
import * as Q from 'q';
import * as is from 'is';
import * as noUiSlider from 'nouislider';
import * as paper from 'paper';

const osd = require('openseadragon');
declare var $;

interface IEventHandlers {
    click: Object;
    drag: Object;
    dragEnd: Object;
    move: Object; // Is paper event, all others are osd events.
    mouseDown: Object;
    mouseUp: Object;
    keyDown: Object;
    keyUp: Object;
}

interface IPaperLayers {
    image: paper.Layer;
    imageOrigin: paper.Layer;
    boundingBox: paper.Layer;
    location: paper.Layer;
}

interface IVisualAnnotation {
    boundingBox: paper.Path;
    location: paper.Path;
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
    private its: ImageToolService;

    private images: Array<HTMLImageElement> = [];
    get imagesCount() {
        return this.images.length;
    }

    private _viewer;
    get viewer() {
        return this._viewer;
    }

    private _overlay;
    get overlay() {
        return this._overlay;
    }

    get cursor() {
        if (this.ws.settings.tool === 'box' || this.ws.settings.tool === 'location' || this.ws.settings.tool === 'imageOrigin') {
            return 'crosshair';
        }
        return '';
    }

    private mousePosition: paper.Point = new paper.Point(0, 0);

    private mouseTracker = null;

    private visualAnnotation: Array<IVisualAnnotation> = [];

    private visualImageOrigin: paper.Path;

    private layers: IPaperLayers = {
        'image': null,
        'imageOrigin': null,
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

    constructor(_ws: WorkspaceService, _it: ImageToolService) {
        this.ws = _ws;
        this.its = _it;
    }

    private frameNavigatorChange(event) {
        this.ws.annotation.currentFrame = parseInt(event.target.value);
    }

    private createBoundingBox(topLeft: paper.Point, bottomRight: paper.Point, index: number) {
        let color: paper.Color;
        let id = this.ws.annotation.data.frames[this.ws.annotation.currentFrameIndex].people[index].id;

        if (!is.number(id)) {
            color = new paper.Color({
                'hue': 0,
                'saturation': 0,
                'brightness': 0.2
            });
        }
        else {
            color = new paper.Color({
                'hue': ((180 * id) + 30 * id) % 360,
                'saturation': 1,
                'brightness': 1
            });
        }

        this.layers.boundingBox.activate();
        let boundingBox = paper.Path.Rectangle(topLeft, bottomRight);
        boundingBox.name = `bbx-${index}`;
        boundingBox.strokeColor = color;
        boundingBox.strokeScaling = false;
        boundingBox.fillColor = color;
        boundingBox.fillColor.alpha = 0.1;

        return boundingBox;
    }

    private createLocationCircle(center: paper.Point, radius: number, index: number) {
        let color: paper.Color;
        let id = this.ws.annotation.data.frames[this.ws.annotation.currentFrameIndex].people[index].id;

        if (!is.number(id)) {
            color = new paper.Color({
                'hue': 0,
                'saturation': 0,
                'brightness': 0.2
            });
        }
        else {
            color = new paper.Color({
                'hue': ((180 * id) + 30 * id) % 360,
                'saturation': 1,
                'brightness': 1
            });
        }

        this.layers.location.activate();
        let location = paper.Path.Circle(center, radius);
        location.name = `loc-${index}`;
        location.fillColor = color;
        location.fillColor.alpha = 0.7;
        return location;
    }

    private createImageOriginCircle(locationPoint) {
        this.layers.imageOrigin.activate();
        let circle = paper.Path.Circle(
            locationPoint,
            5
        );
        circle.fillColor = new paper.Color(0, 0, 255, 0.3);
        return circle;
    }

    private drawVisuals = (frameNumber: number, personIndex?: number) => {
        let frameIndex = frameNumber - 1;
        // Fill array with paper paths representing the bounding boxes of people in current frame
        let newVisuals: Array<IVisualAnnotation> = [];

        let removeVisual = (visual: IVisualAnnotation, index?: number) => {
            if (visual) {
                if (visual.boundingBox) {
                    visual.boundingBox.remove();
                }

                if (visual.location) {
                    visual.location.remove();
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

            if (this.ws.calibration.imageOrigin.isValid()) {
                let newPosition = new paper.Point(this.ws.calibration.imageOriginX, this.ws.calibration.imageOriginY);
                if (!this.visualImageOrigin) {
                    this.visualImageOrigin = this.createImageOriginCircle(
                        newPosition
                    );
                }
                else {
                    this.visualImageOrigin.position = newPosition;
                }
            }

            // Draw new visuals from annotation data
            if (person) {
                if (person.boundingBox.isValid()) {
                    newVisualAnnotation.boundingBox = this.createBoundingBox(
                        new paper.Point(person.boundingBox.left, person.boundingBox.top),
                        new paper.Point(person.boundingBox.right, person.boundingBox.bottom),
                        index
                    );
                }
                if (person.location.virtual.isValid()) {
                    newVisualAnnotation.location = this.createLocationCircle(
                        new paper.Point(person.location.virtual.x, person.location.virtual.y),
                        5,
                        index
                    );
                }
            }

            return newVisualAnnotation;
        }

        if (is.number(personIndex) && personIndex >= 0) {
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
        paper.view.draw();
    }

    private selectPerson(personIndex: number) {
        if (this.visualAnnotation[personIndex]) {
            this.visualAnnotation.filter((visual) => {
                if (visual.boundingBox) {
                    return visual.boundingBox.selected === true;
                }
                return false;
            })
                .forEach((visual) => {
                    visual.boundingBox.selected = false;
                });
            if (this.visualAnnotation[personIndex].boundingBox) {
                this.visualAnnotation[personIndex].boundingBox.selected = true;
            }
        }
        paper.view.draw();
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
                personData.keyframe = true;
            }

            if (visual.location) {
                let shapeLocation = visual.location.position;
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

            this.layers.image.activate();
			
            let center = new paper.Point(
                this.images[index].naturalWidth / 2,
                this.images[index].naturalHeight / 2
            );

            if (!this.layers.image.firstChild) {
                let raster = new paper.Raster(this.images[index].src);
                raster.position = center;
            }
            else {
                let raster = (this.layers.image.firstChild as paper.Raster);
                raster.source = this.images[index].src;
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
        if (!(/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement).nodeName)) ||
            (/^(checkbox|radio|hidden)$/i.test((event.target as HTMLElement).getAttribute('type')))
        ) {
            let handler = this.eventHandlers.keyDown[event.key];
            if (is.function(handler)) {
                handler(event);
            }
        }
    }

    @HostListener('document:keyup', ['$event'])
    private keyUpBinding(event: KeyboardEvent) {
        if (!(/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement).nodeName)) ||
            (/^(checkbox|radio|hidden)$/i.test((event.target as HTMLElement).getAttribute('type')))
        ) {
            let handler = this.eventHandlers.keyUp[event.key];
            if (is.function(handler)) {
                handler(event);
            }
        }
    }

    private bindCanvas() {
        let panning = false;

        this._viewer = osd({
            'element': this.osdBinding.nativeElement,
            'prefixUrl': 'assets/osd-icons/images/',
            'debugMode': false,
            'visibilityRatio': 0.8,
            'constrainDuringPan': true,
            'showNavigator': false,
            'zoomPerScroll': 1.3,
            'zoomPerClick': 1,
            'preserveViewport': true,
            'minZoomImageRatio': 0.8,
            'maxZoomPixelRatio': 2.5,
            'showNavigationControl': false
        });
        this._overlay = this.viewer.paperjsOverlay();

        paper.settings.handleSize = 8;
        paper.settings.hitTolerance = 8;

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
                'fill': true,
                'bounds': true,
                'stroke': false,
                'segments': false,
                'handles': false
            });
            if (hitTest && hitTest.item) {
                if (hitTest.item instanceof paper.Raster || panning === true) {
                    hitTest = null;
                }
            }
            event.hitTest = hitTest;
            return event;
        }

        // Bind the mouse event handlers to the OpenSeadragon tracker.
        this.mouseTracker = new osd.MouseTracker({
            element: this.viewer.canvas,
            clickHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'click');
                paper.view.draw();
            },
            pressHandler: (event) => {
                let modEvent = performHitTest(event);
                if (this.ws.settings.tool === 'box' || this.ws.settings.tool === 'location' || modEvent.hitTest) {
                    this._viewer.setMouseNavEnabled(false);
                }
                else {
                    panning = true;
                }
                callEventHandlers(modEvent, 'mouseDown');
                paper.view.draw();
            },
            releaseHandler: (event) => {
                panning = false;
                this._viewer.setMouseNavEnabled(true);
                let modEvent = performHitTest(event);
                if (modEvent.hitTest) {
                    this.ws.annotation.redrawVisuals = true;
                }
                callEventHandlers(modEvent, 'mouseUp');
                paper.view.draw();
            },
            dragHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'drag');
                paper.view.draw();
            },
            dragEndHandler: (event) => {
                let modEvent = performHitTest(event);
                callEventHandlers(modEvent, 'dragEnd');
                paper.view.draw();
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
        this.layers.image.sendToBack();
    }

    private bindEvents() {
        // Event handler shared variables
        let dragged: any = null;

        // Event handler functions
        let pointToPixel = (point: paper.Point) => {
            let newPoint = new paper.Point(
                Math.floor(point.x),
                Math.floor(point.y)
            );
            return newPoint;
        }

        let itemInsideImage = (item: paper.Item) => {
            if (this.images[this.ws.annotation.currentFrameIndex]) {
                return item.isInside(new paper.Rectangle(
                    new paper.Point(0, 0), new paper.Point(
                        this.images[this.ws.annotation.currentFrameIndex].naturalWidth + 1,
                        this.images[this.ws.annotation.currentFrameIndex].naturalHeight + 1
                    )
                ));
            }
            return false;
        }

        let pointInsideImage = (point: paper.Point) => {
            if (this.images[this.ws.annotation.currentFrameIndex]) {
                let imageSpace = new paper.Rectangle(
                    new paper.Point(0, 0), new paper.Point(
                        this.images[this.ws.annotation.currentFrameIndex].naturalWidth + 1,
                        this.images[this.ws.annotation.currentFrameIndex].naturalHeight + 1
                    )
                )
                return imageSpace.contains(point);
            }
            return false;
        }

        let selectOnClick = (event) => {
            if (event.hitTest && event.hitTest.item && is.string(event.hitTest.item.name)) {
                let hitTest = event.hitTest as paper.HitResult;

                let itemName = event.hitTest.item.name.split('-');
                let selectedPersonIndex = parseInt(itemName[1]);

                if (itemName[0] === 'bbx') {
                    this.ws.annotation.currentPerson = selectedPersonIndex;
                }
            }
        }

        let imageOriginOnClick = (event) => {
            let locationPoint = paper.view.viewToProject(
                new paper.Point(event.position.x, event.position.y)
            );
            if (pointInsideImage(locationPoint)) {
                if (!this.visualImageOrigin) {
                    this.visualImageOrigin = this.createImageOriginCircle(locationPoint);
                }
                else {
                    this.visualImageOrigin.position = locationPoint;
                }

                this.ws.calibration.imageOriginX = Math.floor(this.visualImageOrigin.position.x);
                this.ws.calibration.imageOriginY = Math.floor(this.visualImageOrigin.position.y);
            }
        }

        let locationOnClick = (event, advanceFrame?: boolean) => {
            let locationPoint = paper.view.viewToProject(
                new paper.Point(event.position.x, event.position.y)
            );
            if (pointInsideImage(locationPoint)) {
                this.layers.location.activate();
                let currentFrameIndex = this.ws.annotation.currentFrameIndex;
                let currentPerson = this.ws.annotation.currentPerson;
                if (is.number(currentPerson) && currentPerson >= 0) {
                    if (!this.visualAnnotation[currentPerson].location) {
                        this.visualAnnotation[currentPerson].location = this.createLocationCircle(
                            locationPoint,
                            5,
                            currentPerson
                        );
                    }
                    else {
                        this.visualAnnotation[currentPerson].location.position = locationPoint;
                    }
                    this.pushVisualData(currentPerson);
                    this.ws.autoCoordinate();

                    if (advanceFrame) {
                        this.ws.annotation.currentFrame++;
                    }
                }
            }
        };

        let moveOnDrag = (event) => {
            let hitTest: paper.HitResult = null;
            if (dragged && dragged.item) {
                hitTest = dragged;
            }
            else if (event.hitTest && event.hitTest.item) {
                hitTest = event.hitTest as paper.HitResult;
                dragged = hitTest;
            }

            if (hitTest && hitTest.item && is.string(hitTest.item.name)) {
                let itemName = hitTest.item.name.split('-');
                let selectedPersonIndex = parseInt(itemName[1]);

                if (itemName[0] === 'bbx') {
                    this.ws.annotation.currentPerson = selectedPersonIndex;
                    let delta = (paper.view.viewToProject(
                        new paper.Point(event.delta.x, event.delta.y)
                    ) as any)
                        .subtract(paper.view.viewToProject(
                            new paper.Point(0, 0)
                        )) as paper.Point;

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
                    this.pushVisualData(selectedPersonIndex);
                }
            }
        }

        let boxOnDrag = (event) => {
            let start = paper.view.viewToProject(
                new paper.Point(event.position.x, event.position.y)
            );
            if (pointInsideImage(start)) {
                this.layers.boundingBox.activate();
                let currentPerson = this.ws.annotation.currentPerson;
                if (is.number(currentPerson) && currentPerson >= 0) {
                    let delta = (paper.view.viewToProject(
                        new paper.Point(event.delta.x, event.delta.y)
                    ) as any)
                        .subtract(paper.view.viewToProject(
                            new paper.Point(0, 0)
                        )) as paper.Point;

                    if (!dragged) {
                        if (this.visualAnnotation[currentPerson].boundingBox) {
                            this.visualAnnotation[currentPerson].boundingBox.remove();
                        }
                        let end = new paper.Point(start.x + delta.x, start.y + delta.y);
                        if (pointInsideImage(end)) {
                            let boundingBox = this.createBoundingBox(
                                start,
                                end,
                                currentPerson
                            )
                            this.visualAnnotation[currentPerson].boundingBox = boundingBox;
                            dragged = boundingBox;
                            this.selectPerson(currentPerson);
                        }
                    }
                    else {
                        let boundingBox = dragged as paper.Path;
                        let end = (boundingBox.bounds.bottomRight as any).add(new paper.Point(delta.x, delta.y));
                        if (pointInsideImage(end)) {
                            let start = boundingBox.bounds.topLeft;
                            boundingBox.remove();
                            boundingBox = this.createBoundingBox(
                                start,
                                end,
                                currentPerson
                            )
                            this.visualAnnotation[currentPerson].boundingBox = boundingBox;
                            dragged = boundingBox;
                            this.selectPerson(currentPerson);
                        }
                    }
                    this.pushVisualData(currentPerson);
                }
            }
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
            this.ws.settings.tool = 'pointer';
        });

        // Box drawer
        this.on('keyDown', 'r', (event) => {
            this.ws.settings.tool = 'box';
        });

        // Location marker
        this.on('keyDown', 't', (event) => {
            this.ws.settings.tool = 'location';
        });

        // Mixed mode
        this.on('keyDown', 'c', (event) => {
            this.ws.settings.mode = 'mixed';
        });

        // Location mode
        this.on('keyDown', 'v', (event) => {
            this.ws.settings.mode = 'location';
        });

        // Interpolate bounding box from keyframes
        this.on('keyDown', 'd', (event) => {
            this.ws.interpolateToCurrent();
        });
		
		// Automatic real location via Camera-Tool
        this.on('keyDown', 'f', (event) => {
            this.ws.autoCoordinate();
        });

        // Report mouse position
        this.on('move', 'mousePosition', (event) => {
            if (pointInsideImage(event.point)) {
                this.mousePosition = pointToPixel(event.point);
            }
        })

        // Select paper objects
        this.on('click', 'mixed.pointer.click', (event) => {
            if (this.ws.settings.tool === 'pointer') {
                selectOnClick(event);
            }
        });

        // Set location marker
        this.on('click', 'mixed.location.click', (event) => {
            if (this.ws.settings.mode === 'mixed' && this.ws.settings.tool === 'location') {
                locationOnClick(event);
                this.ws.settings.tool = 'pointer';
            }
        });

        // Set location marker in location mode
        this.on('click', 'location.location.click', (event) => {
            if (this.ws.settings.mode === 'location' && this.ws.settings.tool === 'location') {
                locationOnClick(event, true);
            }
        });

        // Set image origin marker
        this.on('click', 'common.imageOrigin.click', (event) => {
            if (this.ws.settings.tool === 'imageOrigin') {
                imageOriginOnClick(event);
                if (this.ws.settings.mode === 'location') {
                    this.ws.settings.tool = 'location';
                }
                else {
                    this.ws.settings.tool = 'pointer';
                }
            }
        });

        // Drag paper objects
        this.on('drag', 'mixed.pointer.drag', (event) => {
            if (this.ws.settings.tool === 'pointer') {
                moveOnDrag(event);
            }
        });

        // Create bounding box via drag
        this.on('drag', 'mixed.box.drag', (event) => {
            if (this.ws.settings.tool === 'box') {
                boxOnDrag(event);
            }
        });

        // After dragging paper objects
        this.on('dragEnd', 'common.dragEnd', (event) => {
            dragged = null;
            if (this.ws.settings.mode === 'mixed' && this.ws.settings.tool === 'box') {
                this.ws.settings.tool = 'pointer';
            }
        });
    }

    private loadImages(dir: string, filenames: Array<string>): Q.Promise<{}> {
        let promises: Array<Q.Promise<{}>> = [];

        this.images = filenames.map((filename, index) => {
            // Set up deferred object to represent the 'image loaded' event
            let deferred: Q.Deferred<{}> = Q.defer();
            promises.push(deferred.promise);

            let image = new Image();
            let imageSrc = image.src = path.join(dir, filename);

            image.onload = () => {
                deferred.resolve(image.src);
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
                        // TODO: Move loading resolver elsewhere 
                        Loader.finish();
                        if (this.images[0]) {
                            this.viewer.open(new osd.ImageTileSource({
                                'url': this.images[0].src,
                                'buildPyramid': false
                            }));
                            if (!this.ws.annotation.currentFrame) {
                                this.ws.annotation.currentFrame = 1;
                            }
                            
                        }
                        else {
                            throw 'Error: No images found.';
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
                    this.drawVisuals(this.ws.annotation.currentFrame);
                });
        }
    }

    public ngOnDestroy() {
        if (this.ws.initialised) {
            // Memory management to remove references to unused objects.
            this.images = null;

            paper.view.off('mousemove');
            paper.view.remove();
            paper.project.remove();

            window.onresize = undefined;
            this.mouseTracker ? this.mouseTracker.destroy() : null;
            this.mouseTracker = null;

            this._viewer ? this._viewer.destroy() : null;
            this._viewer = null;

            this._overlay = null;

            this.osdBinding = null;
        }
    }
}