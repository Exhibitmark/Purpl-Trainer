const EventEmitter = require('./EventEmitter');
const MemoryHandler = require('./MemoryHandler');
const { readFile } = require('./file');
const { debug } = require('./debug');

const { offsets } = readFile('./offsets.json');

class PurplTrainer {
    constructor(stateEmitter) {
        this.mh = new MemoryHandler();
        this.events = new EventEmitter();
        this.state = stateEmitter;
        this.getState();

        this.events.on('*', (commandStr) => {
            if (commandStr) {
                const command = offsets.find(o => o.name === commandStr);
                this.runCommand(command);
            }
        });
    }

    runCommand(command) {
        let address = command.address;
        if (command.dataType === 'pointer') {
            let buffer;
            if (this.stateObj[command.name] === command.reset.toLowerCase()) {
                buffer = Buffer.from(command.value, 'hex');
            } else if (this.stateObj[command.name] === command.value.toLowerCase()) {
                buffer = Buffer.from(command.reset, 'hex');
            }
            address = this.mh.getAddressFromPointer(command.address, command.pointerLength, command.offsets);
            debug(address);
            this.mh.writeBuffer(address, buffer, false);
        } else {
            if (this.stateObj[command.name] === command.value.toLowerCase()) {
                this.mh.writeMemory(parseInt(address, 16), parseInt(command.reset, 16), command.dataType);
            } else if (this.stateObj[command.name] === command.reset.toLowerCase()) {
                this.mh.writeMemory(parseInt(address, 16), parseInt(command.value, 16), command.dataType);
            } else {
                console.error(`Expected value at ${command.address} to be ${command.value} or ${command.reset}. Instead found ${this.stateObj[command.name]}`);
            }
        }
        this.getState();
    }

    addEventSource(emitter) {
        this.events.add(emitter);
    }

    async getState() {
        const state = offsets.reduce((acc, val) => {
            let address = val.address;
            if (val.dataType === 'pointer') {
                address = this.mh.getAddressFromPointer(val.address, val.pointerLength, val.offsets);
                const dataLength = Math.floor(val.value.length / 2);
                const bfr = this.mh.readBuffer(address, dataLength, false);
                acc[val.name] = MemoryHandler.bufferToHex(bfr);
            } else {
                acc[val.name] = Number(this.mh.readMemory(parseInt(address, 16), val.dataType)).toString(16);
            }

            return acc;
        }, {});
        this.state.emit('state', state);
        this.stateObj = state;
    }
}

module.exports = PurplTrainer;