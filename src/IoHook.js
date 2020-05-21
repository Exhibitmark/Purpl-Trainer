const EventEmitter = require('./EventEmitter');
const ioHook = require('iohook');
const { readFile } = require('./file');
const settings = readFile('./config.json');
const { keyboard } = settings;

class IoHook {
    constructor() {
        this.events = new EventEmitter();
        ioHook.start();
        ioHook.on('keydown', (event => {
            const [boundFn] = this.getKeyBinding(event.rawcode) || [];
            if (boundFn) {
                this.events.emit(boundFn);
            }
        }).bind(this))
    }

    getKeyBinding(pressedKey) {
        return Object.entries(keyboard).find(([boundEvent, assignedKey]) => assignedKey === pressedKey)
    }
}

module.exports = IoHook;