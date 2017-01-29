import { Injectable } from '@angular/core';

@Injectable()
export class StatusService {
    private _blocking: boolean = false;
    private _working: boolean = false;
    constructor() {
    }
}