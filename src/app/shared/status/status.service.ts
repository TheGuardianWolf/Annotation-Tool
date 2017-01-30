import { Injectable } from '@angular/core';

@Injectable()
export class StatusService {
    private _blocking: boolean = false;
    private _working: boolean = false;

    private _busy: boolean;
    private _busyChain: Q.Promise<any>;
    get busy() {
        return this._busy;
    }

    private chainBusy(promises: Array<Q.Promise<any>>) {
        this._busy = true;

        let setBusy = () => {
            this._busy = true;
        }

        let setFree = () => {
            this._busy = false;
        }

        if (!this._busyChain || this._busyChain.isFulfilled) {
            if (this._busyChain) {
                this._busyChain.done();
            }
            this._busyChain = Q.allSettled([...promises])
                .then(setFree);
        }
        else {
            this._busyChain
                .then(setBusy).done();
            this._busyChain = Q.allSettled<Q.Promise<any>>([...promises, this._busyChain])
                .then(setFree);
        }
    }

    constructor() {
    }
}