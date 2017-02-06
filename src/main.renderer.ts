import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// include for production builds
// import {enableProdMode} from '@angular/core';

import { Loader } from './app/shared/classes/loader';
import { AppModule } from './app/app.module';

// enableProdMode() // include for production builds

export function main() {
    return platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
}

// support async tag or hmr
switch (document.readyState) {
    case 'interactive':
    case 'complete':
        main();
        break;
    case 'loading':
    default:
        Loader.create();
        document.addEventListener('DOMContentLoaded', () => {
            main()
            Loader.finish()
        });
}

require('styles/style.scss'); // webpack to compile scss
