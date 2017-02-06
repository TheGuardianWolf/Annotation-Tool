const pleaseWait = require('please-wait').pleaseWait;

export class Loader {
    static loader;

    constructor() {
    }

    static create(message?: string) {
        Loader.loader = pleaseWait({
            logo: 'assets/logo/logo.png',
            backgroundColor: '#009688',
            loadingHtml: `
                <div class="loader sk-wandering-cubes">
                    <div class="sk-cube sk-cube1"></div>
                    <div class="sk-cube sk-cube2"></div>
                </div>
                <h3 class="loading-message">
                    ${message ? message : ''}
                </h3>
            `
        });
    }

    static finish() {
        Loader.loader.finish();
    }
}