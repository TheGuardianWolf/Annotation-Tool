import * as path from 'path';
const OpenSeadragon = require('openseadragon');

export class Canvas {
    private tileSources = [];
    public loadTileSources(dir: string, filenames: Array<string>) {
        filenames.forEach((filename) => {
            // Add to openseadragon tileSources
            this.tileSources.push(
                new OpenSeadragon.ImageTileSource({
                        url: path.join(dir, filename)
                    })
            );
        });
    }

    private viewer;
    private overlay;

    constructor() { }

    public init(_element: HTMLElement) {
        this.viewer = OpenSeadragon({
            element: _element,
            tileSources: this.tileSources,
            sequenceMode: true,
            prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
            debugMode: false,
            visibilityRatio: 1.0,
            constrainDuringPan: true,
            showNavigator: true,
            zoomPerScroll: 1.8
        });
        this.overlay = this.viewer.paperjsOverlay();
    }
}