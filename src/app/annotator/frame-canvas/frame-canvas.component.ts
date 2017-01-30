import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WorkspaceService } from '../../shared/workspace/workspace.service';

import * as path from 'path';
import * as Q from 'q';
import * as is from 'is';
import * as noUiSlider from 'nouislider';

const paper = require('paper');
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

    //private _zoom: Number = 1;
    //get zoom() {
    //    return this._zoom;
    //}
    //set zoom(value) {
    //    if (value <= 0.8) {
    //        value = 0.8
    //    }
    //    else if (value >= 2.5) {
    //        value = 2.5;  
    //    }

    //    if (this._zoom !== value) {
    //        this._zoom = value;
    //        this.viewer.viewport.zoomTo(this._zoom, this.viewer.viewport.getCenter());
    //    }
    //}

    private _viewer;
    get viewer() {
        return this._viewer;
    }

    private _overlay;
    get overlay() {
        return this._overlay;
    }

    private boundingBoxes: Array<any> = [];

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

    public changeFrame = (frameNumber) => {
        if (frameNumber) {
            let index = frameNumber - 1;
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

        // Bind the mouse event handlers to the OpenSeadragon tracker.
        new osd.MouseTracker({
            element: this.viewer.canvas,
            pressHandler: (event) => {
                Object.keys(this.eventHandlers.click).forEach(
                    (key) => {
                        if (is.function(this.eventHandlers.click[key])) {
                            this.eventHandlers.click[key](event);
                        }
                    }
                )
            },
            dragHandler: () => {
                Object.keys(this.eventHandlers.drag).forEach(
                    (key) => {
                        if (is.function(this.eventHandlers.drag[key])) {
                            this.eventHandlers.drag[key](event);
                        }
                    }
                )
            },
            dragEndHandler: () => {
                Object.keys(this.eventHandlers.dragEnd).forEach(
                    (key) => {
                        if (is.function(this.eventHandlers.dragEnd[key])) {
                            this.eventHandlers.dragEnd[key](event);
                        }
                    }
                )
            }
        }).setTracking(true);
    }

    private bindKeys() {
        // Previous frame
        this.on('keyDown', 'z', (event) => {
            this.ws.annotation.currentFrame--;
        });

        // Next frame
        this.on('keyDown', 'x', (event) => {
            this.ws.annotation.currentFrame++;
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
            this.bindKeys();

            let dynamicResizeCanvas = () => {
                this._overlay.resize();
                this._overlay.resizecanvas();
            };

            window.onresize = dynamicResizeCanvas;

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

            this.ws.annotation.currentFrameObs.subscribe(this.changeFrame);
        }
    }

    public ngOnDestroy() {
        if (this.ws.initialised) {
            window.onresize = undefined;
        }
    }
}