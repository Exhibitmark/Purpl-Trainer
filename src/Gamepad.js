const { debug } = require('./debug');
const EventEmitter = require('./EventEmitter');
const { readFile } = require('./file');
const { controller } = readFile('./config.json');
const gamepad = require('gamepad');

class Gamepad {
    constructor() {
        this.events = new EventEmitter();
        // gamepad.init();
        // setInterval(gamepad.detectDevices, 500);
        // setInterval(gamepad.processEvents, 16);
        
        gamepad.on('up', (id, num) => {
            debug(num);
            const [boundFn] = this.getKeyBinding(num) || [];
            if (boundFn) {
                this.events.emit(boundFn);
            }
        })
    }

    getKeyBinding(pressedKey) {
        return Object.entries(controller).find(([boundEvent, assignedKey]) => assignedKey === pressedKey)
    }
}

module.exports = Gamepad;