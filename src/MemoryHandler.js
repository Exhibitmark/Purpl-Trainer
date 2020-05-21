const mem = require('bindings')('../taskDependents/worker.node');
const { debug, clear } = require('./debug');

class MemoryHandler {
    get base() {
        return this.dll.modBaseAddr;
    }
    get handle() {
        return this.process.handle;
    }

    constructor() {
        this.mem = mem;
        this.process = mem.openProcess('MCC-Win64-Shipping.exe') || mem.openProcess('MCC-Win64-Shipping-WinStore.exe');
        this.dll = mem.findModule('halo2.dll', this.process.th32ProcessID);
    }

    getAddressFromPointer(entry, pointerLength, offsets) {
        const absolutePointer = this.base + MemoryHandler.fromHex(entry);
        const offsetCopy = [...offsets.reverse()];
        let pointer = MemoryHandler.fromHex(
            MemoryHandler.bufferToHex(mem.readBuffer(this.handle, absolutePointer, pointerLength), true)
        );
        while (offsetCopy.length > 1) {
            pointer = MemoryHandler.fromHex(
                MemoryHandler.bufferToHex(mem.readBuffer(this.handle, pointer + offsetCopy.pop(), pointerLength), true)
            );
        }
        
        return pointer + offsetCopy.pop();
    }
    
    readBuffer(address, length, includeBase = true) {
        return this.mem.readBuffer(this.handle, (includeBase ? this.base : 0) + address, length);
    }

    readMemory(address, type, includeBase = true) {
        return this.mem.readMemory(this.handle, (includeBase ? this.base : 0) + address, type);
    }

    writeBuffer(address, buffer, includeBase = true) {
        return this.mem.writeBuffer(this.handle, (includeBase ? this.base : 0) + address, buffer);
    }

    writeMemory(address, value, type, includeBase = true) {
        return this.mem.writeMemory(this.handle, (includeBase ? this.base : 0) + address, value, type);
    }

    static intToHex(int) {
        return Number(int).toString(16);
    }

    static fromHex(str) {
        return parseInt(str, 16);
    }

    static bufferToHex(bfr, reverse = false) {
        const str = bfr.toString('hex')
        if (reverse) {
            return str.match(/../g).reverse().join("");
        }
        return str;
    }
}

module.exports = MemoryHandler;