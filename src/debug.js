const DEBUG = false;

function debug(...args) {
    if (DEBUG) {
        console.debug(...args);
    }
}

function clear() {
    if (! DEBUG) {
        console.clear();
    }
}

module.exports = {
    debug,
    clear,
}