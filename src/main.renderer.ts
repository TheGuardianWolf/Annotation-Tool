import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// include for production builds
// import {enableProdMode} from '@angular/core';

import {AppModule} from './app/app.module';

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
    document.addEventListener('DOMContentLoaded', () => main());
}

require('styles/style.scss'); // webpack to compile scss
