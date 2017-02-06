import { Injectable } from '@angular/core';

import * as Q from 'q';

@Injectable()
export class StatusService {
    // TODO: Get status working with please wait.
    private _blocking: boolean = false;
    get blocking() {
        return this._working;
    }

    private _working: boolean = false;
    get working() {
        return this._working;
    }

    constructor() {
    }
}