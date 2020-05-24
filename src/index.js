const MemoryHandler = require('./MemoryHandler');
const UI = require('./UI');
const IoHook = require('./IoHook');
const PurplTrainer = require('./PurplTrainer');
const EventEmitter = require('./EventEmitter');
// const Gamepad = require('./Gamepad');

const iohook = new IoHook();
// const gamepad = new Gamepad();
const stateEmitter = new EventEmitter();
const ui = new UI(stateEmitter);
const trainer = new PurplTrainer(stateEmitter);

trainer.addEventSource(ui.events);
trainer.addEventSource(iohook.events);
// trainer.addEventSource(gamepad.events);