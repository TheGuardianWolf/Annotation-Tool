export class Settings {
    public copyBox: boolean = true;
    public copyLocation: boolean = true;
    public _mode: string = 'mixed'; // 'mixed' or 'location'.
    get mode() {
        return this._mode;
    }
    set mode(value) {
        if (value !== this._mode) {
            if (value === 'location') {
                this.copyBox = false;
                this.copyLocation = true;
                this.tool = 'location';
            }

            this._mode = value;
        }
    }
    public tool: string = 'pointer'; // 'pointer' or 'box' or 'location' or 'imageOrigin'
}