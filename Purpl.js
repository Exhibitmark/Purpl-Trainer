const fs = require('fs');
const ioHook = require('iohook');
const prompts = require('prompts');
//const gamepad = require("gamepad");
const chalk = require("chalk");
const mem = require('bindings')('../taskDependents/worker.node')
const settings = readFile('./config.json');
const {controller, keyboard} = settings;
const config = readFile('./offsets.json');
const ea = []
let proc;
const packs = generatePacks()
const purplCommands = generatePurplCommands()
const globals = generateGlobals()

//Object of keys
const mappings = {
    8: 'backspace',
    9: 'tab',
    12: 'clear',
    13: 'enter',
    16: 'shift',
    17: 'ctrl',
    18: 'alt',
    19: 'pause break',
    20: 'caps lock',
    27: 'escape',
    32: 'space',
    33: 'page up',
    34: 'page down',
    35: 'end',
    36: 'home',
    37: 'left arrow',
    38: 'up arrow',
    39: 'right arrow',
    40: 'down arrow',
    41: 'select',
    42: 'print',
    43: 'execute',
    44: 'print screen',
    45: 'insert',
    46: 'delete',
    47: 'help',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    58: ':',
    59: 'semicolon',
    60: '<',
    61: 'equals',
    64: '@',
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'w',
    88: 'x',
    89: 'y',
    90: 'z',
    91: 'windows key left',
    92: 'windows key right',
    93: 'menu right',
    95: 'sleep',
    96: 'numpad 0',
    97: 'numpad 1',
    98: 'numpad 2',
    99: 'numpad 3',
    100: 'numpad 4',
    101: 'numpad 5',
    102: 'numpad 6',
    103: 'numpad 7',
    104: 'numpad 8',
    105: 'numpad 9',
    106: 'multiply',
    107: 'add',
    108: 'numpad period',
    109: 'subtract',
    110: 'decimal point',
    111: 'divide',
    112: 'f1',
    113: 'f2',
    114: 'f3',
    115: 'f4',
    116: 'f5',
    117: 'f6',
    118: 'f7',
    119: 'f8',
    120: 'f9',
    121: 'f10',
    122: 'f11',
    123: 'f12',
    124: 'f13',
    125: 'f14',
    126: 'f15',
    127: 'f16',
    128: 'f17',
    129: 'f18',
    130: 'f19',
    131: 'f20',
    132: 'f21',
    133: 'f22',
    134: 'f23',
    135: 'f24',
    136: 'f25',
    137: 'f26',
    138: 'f27',
    139: 'f28',
    140: 'f29',
    141: 'f30',
    142: 'f31',
    143: 'f32',
    144: 'num lock',
    145: 'scroll lock',
    160: '^',
    161: '!',
    162: '؛',
    163: '#',
    164: '$',
    166: 'page backward',
    167: 'page forward',
    168: 'refresh',
    170: '*',
    171: '~ + * key',
    172: 'home key',
    173: 'minus',
    174: 'decrease volume level',
    175: 'increase volume level',
    176: 'next',
    177: 'previous',
    178: 'stop',
    179: 'play',
    181: 'mute',
    182: 'decrease volume level',
    183: 'increase volume level',
    186: 'semi-colon / ñ',
    187: 'equal sign',
    188: 'comma',
    189: 'dash',
    190: 'period',
    191: 'forward slash',
    192: 'tilde',
    194: 'numpad period',
    219: 'open bracket',
    220: 'back slash',
    221: 'close bracket',
    222: 'single quote',
    223: '`'
};
//Object of button codes
const buttons = {
    0 : "dpad up",
    1 : "dpad down",
    2 : "dpad left",
    3 : "dpad right",
    4 : "start",
    5 : "back",
    6 : "left thumbstick",
    7 : "right thumbstick",
    8 : "left bumper",
    9 : "right bumper",
    10 : "a",
    11 : "b",
    12 : "x",
    13 : "y"
}

const skullEnums = {
    "gruntBirthday" : 1,
    "unk" : 2,
    "unk" : 3,
    "unk" : 4,
    "unk" : 5,
    "blind" : 6,
    "unk" : 7,
    "blackeye" : 8,
    "unk" : 9,
    "sputnik" : 10,
    "unk" : 11,
    "unk" : 12,
    "unk" : 13,
    "unk" : 14,
    "bandana" : 15,
    "boom" : 16,
    "eyePatch" : 17,
    "unk" : 18,
    "foreign" : 19,
    "gruntFuneral" : 20,
    "unk" : 21,
    "recession" : 22,
    "malfunction" : 23,
    "streaking" : 24,
    "unk" : 25,
    "scarab" : 26,
    "feather" : 28
}

startup(commandStart)

function generatePurplCommands() {
    let purplCommands = [{
        title: chalk.bold('Packs'),
        value: {"type":"packs","name":""}
    },{
        title:chalk.bold('Go Back'),
        value:"back"
    }]

    config.purpl.forEach(function(e){
        const option = {
            title: chalk.bold(e.description),
            value: {"type":"mod","name":e.name}
        }
        ea.push(e)
        purplCommands.unshift(option)
    });
    return purplCommands
}

function generateGlobals() {
    let globals = []
    config.global.forEach(function(e){
        const option = {
            title: chalk.bold(e.description),
            value: e.name
        }
        const modEA = {
            name: e.name,
            address: e.address
        }
        ea.push(modEA)
        globals.push(option)
    });
    return globals
}

function generatePacks() {
    let purplPacks = [{
        title:chalk.bold('Go Back'),
        value:"back"
    }]
    config.packs.forEach(function(e){
        const option = {
            title: chalk.bold(e.name),
            value: {"type":"pack","name":e.name}
        }
        purplPacks.unshift(option)
    });
    return purplPacks
}

function renderer(items) {
    (async () => {
        const response = await prompts(
            {
                type: 'select',
                name: 'commands',
                message: chalk.black.bgWhite.bold('Available Commands'),
                choices: items
            }
        );
        let r = response.commands
        switch(r.type) {
            case 'packs':
                console.clear()
                renderer(packs)
                break;
            case 'mod':
                startup(skulls)
                break;
            case 'pack':
                renderer(purplCommands)
            case 'back':
                renderer(purplCommands)
        }
    })();
    
}

function setup() {
    (async () => {
        const response = await prompts(
            {
                type: 'multiselect',
                name: 'bindTypes',
                message: 'Select what inputs you want to configure.',
                choices: [
                    { title: chalk.bold('Keyboard'), value: 'keyboard'},
                    { title: chalk.bold('Controller'), value: 'controller'}
                ]
            }
        );
        let result = response.bindTypes[0]
        if(response.bindTypes.length > 1){
            result = 'both'
        }

        switch(result) {
            case 'keyboard':
                setRevertBinding('keyboard',0)
                break;
            case 'controller':
                setRevertBinding('controller', 0)
                break;
            case 'both':
                setRevertBinding('keyboard',1)
                break;
            default:
                startup(commandStart)
        } 
    })();
}

function startup(cb) {
    console.clear()
    console.log(chalk.magenta.bold(String.raw`
     _____    _    _   _____    _____    _      
    |  __ \  | |  | | |  __ \  |  __ \  | |     
    | |__) | | |  | | | |__) | | |__) | | |     
    |  ___/  | |  | | |  _  /  |  ___/  | |     
    | |      | |__| | | | \ \  | |      | |____ 
    |_|       \____/  |_|  \_\ |_|      |______|
                     
    `))
    console.log(chalk.magenta.bold('Close the app by pressing Ctrl+C')+'\n\n')
    cb()
}

function getSkullEnum(name) {
    return skullEnums[name]
}

function getModAddress(name) {
    return ea.find(p => p.name === name)
}

function applyPack(pack) {
    let s = ea.find(p => p.name === 'skulls')
    pack.skulls.forEach(function(e){
        let skull = getSkullEnum(e)
        writeMem(Number('0x' + s.address) + skull, 0x01, "byte")
    })

    pack.mods.forEach(function(e){
        let a = getModAddress(e)
        let test = Number('0x' + a.value)
        writeMem(Number('0x' + a.address), test, "byte")
    })
}

function buildPointer(offsets) {
    //Offsets is an array of N-offsets that contain the hex values to build the current address of a pointer
    let address = ea['dll'].modBaseAddr
    offsets.forEach(function(o) {
        newer = mem.readMemory(proc.handle, address + Number('0x' + o), "ptr");
        fullPointers[key] = previous + parseInt(arr[i],16);
        return previous
    });
}

function commandStart() {
    (async () => {
        const response = await prompts(
            {
                type: 'select',
                name: 'commands',
                message: chalk.black.bgWhite.bold('Available Commands'),
                choices: [
                    { title: chalk.bold('Keybinds'),description: chalk.white('Configure bindings'), value: 'keybinds' },
                    { title: chalk.bold('Purpl'), description: chalk.white("Enable Purpl once you're in game"), value: 'enable' },
                    { title: chalk.bold('Help'), description: chalk.white('Stop it. Get some help'), value:"help"}
                ]
            }
        );

        switch(response.commands) {
            case 'keybinds':
                setup()
                break;
            case 'enable':
                startPurpl()
                break;
            case 'help':
                break;
        }
    })();
}

function purplToggles() {
    (async () => {
        const response = await prompts(
            {
                type: 'select',
                name: 'commands',
                message: chalk.black.bgWhite.bold('Purpl Toggles'),
                choices: purplCommands
            }
        );

        switch(response.commands) {
            case 'grenades':
                writeMem(ea["infGrenades"],0x90, "byte")
                writeMem(ea["infGrenades"]+1,0x90, "byte")
                startup(purplToggles)
                break;
            case 'bottomless':
                writeMem(ea["bottomlessClip"],0x85, "byte")
                startup(purplToggles)
                break;
            case 'godmode':
                writeMem(ea["godmode"],0x0150, "short")
                startup(purplToggles)
                break;
            case 'hudless':
                if(purplState.hud == 0){
                    writeMem(ea["hud"],0x01, "byte")
                    purplState["hud"] = 1
                } else{
                    writeMem(ea["hud"],0x00, "byte")
                    purplState["hud"] = 0
                }
                startup(purplToggles)
                break;
            case 'wireframe':
                //update()
                break;
        }
    })();
}

function startPurpl() {
    if(proc == undefined){
        proc = mem.openProcess("MCC-Win64-Shipping.exe");
        ea['dll'] = getModuleBase()
    }
    inputInit()
    renderer(purplCommands)
   // gamepadInit() 
}

function skulls() {
    (async () => {
        const response = await prompts(
            {
                type: 'multiselect',
                name: 'skulls',
                message: 'Toggles skulls on/off in multiplayer',
                choices: [
                    { title: chalk.bold('Sputnik'), value: 'sputnik'},
                    { title: chalk.bold('Blind'), value: 'blind'}
                ]
            }
        );
        startup(commandStart)
    })();
}

function getSkullState() {
    let state = ''
    for(var i = 0; i < 16; i++){
        state += readMem(ea["skullSputnik"]+i, "byte")
    }
    console.log(state)
    return state
}

function registerKey(k) { 
    let match;
    Object.keys(mappings).forEach(function(item) {
        if(mappings[item] == k){
            match = item
        }
    });
    return match
}

function registerButton(k) { 
    let match;
    Object.keys(buttons).forEach(function (item) {
        if(buttons[item] == k){
            match = item
        }
    });
    return match
}

function inputInit() {
    ioHook.start()
    ioHook.on('keydown', event => {
        if(event.rawcode == keyboard.checkpoint){
            writeMem(ea["checkpoint"], 3, "byte")
        }
        else if(event.rawcode == keyboard.revert){
            writeMem(ea["revert"], 1, "byte")
        }
    });
} 

function gamepadInit() {
    gamepad.init()
    setInterval(gamepad.processEvents, 100);
    gamepad.on("down", function (id, num) {
        if(num == controller.checkpoint){
            writeMem(ea["checkpoint"], 3, "byte")
        }
        else if(num == controller.revert){
            writeMem(ea["revert"], 1, "byte")
        }
    });
}

function getModuleBase() {
    return mem.findModule('halo2.dll', proc.th32ProcessID);
}

function writeMem(address, value, type) {
    mem.writeMemory(proc.handle, ea['dll'].modBaseAddr + address, value , type);
}

function readMem(address, type) {
    return mem.readMemory(proc.handle, ea['dll'].modBaseAddr + address, type);
}

function writeFile(file,content) {  
    fs.writeFile(file, JSON.stringify(content), function (err) {
        if (err) throw err;
        console.log('Config Saved!');
    });
}

function readFile(file){  
    const f = fs.readFileSync(file)
    return JSON.parse(f)
};

function setRevertBinding(input, e) {
    (async () => {
        const response = await prompts({
          type: 'text',
          name: 'revert',
          message: 'What key do you want revert to be?'
        });
        
        if(input == 'keyboard'){
            let remapped = registerKey(response.revert)
            if(remapped !== undefined){
                keyboard.revert = Number(remapped)
            }
        }
        else if(input == 'controller'){
            let remapped = registerButton(response.revert)
            if(remapped !== undefined){
                controller.revert = Number(remapped)
            }
        }
        setCheckpointBinding(input, e)
    })(); 
}

function setCheckpointBinding(input,e) {
    (async () => {
        const response = await prompts({
          type: 'text',
          name: 'checkpoint',
          message: 'What key do you want checkpoint to be?'
        });
        
        if(input == 'keyboard'){
            let remapped = registerKey(response.checkpoint)
            if(remapped !== undefined){
                keyboard.checkpoint = Number(remapped)
            }
        }
        else if(input == 'controller'){
            let remapped = registerButton(response.checkpoint)
            if(remapped !== undefined){
                controller.checkpoint = Number(remapped)
            }
        }

        if(e == 1) {
            setRevertBinding('controller', 0)
        }
        if(e == 0) {
            writeFile('./config.json', {controller,keyboard})
            startup(commandStart)
        }
    })();
}
