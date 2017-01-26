import * as path from 'path';
import * as Q from 'q';

const paper = require('paper');
const OpenSeadragon = require('openseadragon');

export class Canvas {	
    private tileSources = [];
    private images: Array<HTMLImageElement> = [];

    public loadImages(dir: string, filenames: Array<string>): Q.Promise<{}> {
        let promises: Array<Q.Promise<{}>> = [];
        
        this.images = filenames.map((filename) => {
            // Set up deferred object to represent the 'image loaded' event
            let deferred: Q.Deferred<{}> = Q.defer();
            promises.push(deferred.promise);

            let image = new Image();
            image.onload = () => {
                deferred.resolve(image.src);
            };
            image.onerror = (err) => {
                deferred.reject(err);
            }

            // Add image to imageSrc array
            image.src = path.join(dir, filename); 
            return image;
        });

        return Q.all(promises);
    }

    private viewer;
    private overlay;

    constructor() { }

    public bind(container: HTMLElement) {
        this.viewer = OpenSeadragon({
            'element': container,
            'tileSources': this.tileSources,
            'sequenceMode': true,
            'prefixUrl': "https://openseadragon.github.io/openseadragon/images/",
            'debugMode': false,
            'visibilityRatio': 1.0,
            'constrainDuringPan': true,
            'showNavigator': true,
            'zoomPerScroll': 1.8
        });
        this.overlay = this.viewer.paperjsOverlay();
    }
}