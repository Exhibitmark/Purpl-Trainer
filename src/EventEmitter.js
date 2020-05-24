'use strict';
var EventEmitter = require('events');

class MyEmitter extends EventEmitter {
    emit(type, ...args) {
        
        return super.emit('*', type, ...args);
    }

    add(emitter) {
        emitter.on('*', (type, ...args) => {
            this.emit(type, ...args);
        })
    }
}

module.exports = MyEmitter;
