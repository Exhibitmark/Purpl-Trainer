const DEBUG = false;

const fs = require('fs');
const ioHook = require('iohook');
const prompts = require('prompts');
const chalk = require("chalk");
const mem = require('bindings')('../taskDependents/worker.node')
const settings = readFile('./config.json');
const {controller, keyboard} = settings;
const config = readFile('./offsets.json');
const ea = []
let purplState = {};
let proc;
const packs = generatePacks()
const globals = generateGlobals()
const { mappings, buttons, skullEnums } = require('./constants');


startup(commandStart)

function generatePurplCommands() {
    let purplCommands = [
        // {
        //     title: chalk.bold('Packs'),
        //     value: {"type":"packs","name":""}
        // },
        {
            title:chalk.bold('Go Back'),
            value:"back"
        }
    ]

    updateState();

    config.purpl.forEach(function(e){
        const option = {
            title: getTitle(e),
            value: {"type":"mod",...e}
        }
        ea.push(e)
        purplCommands.unshift(option)
    });
    return purplCommands
}

function getTitle(entry) {
    return `${chalk.bold(entry.description)} ${purplState[entry.name] === entry.value.toLowerCase() ? chalk.green('Enabled') : chalk.red('Disabled')}`;
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
            value: {"type":"pack",...e}
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
                if (r.dataType === 'pointer') {
                    if (! r.offsets) {
                        console.error('Data type pointer must have an array of offsets');
                    }
                    let pointer = ea['dll'].modBaseAddr + parseInt(r.address, 16); 
                    debug({pointer: Number(pointer).toString(16)})
                    const offsetsCopy = [...r.offsets];
                    const finalOffset = offsetsCopy.pop();
                    const offsets = [...offsetsCopy.reverse(), 0];
                    while (offsets.length > 0) {
                        const currentOffset = offsets.pop();
                        pointer = parseInt(mem.readBuffer(proc.handle, pointer + currentOffset, 8).toString('hex').match(/../g).reverse().join(""), 16)
                        debug({pointer: Number(pointer).toString(16), buffer: mem.readBuffer(proc.handle, pointer, 6)})
                    }
                    // acc[r.name] = mem.readBuffer(proc.handle, pointer + finalOffset, 6).toString('hex');
                    let buffer;
                    if (purplState[r.name] === r.reset.toLowerCase()) {
                        buffer = Buffer.from(r.value, 'hex');
                    } else if (purplState[r.name] === r.value.toLowerCase()) {
                        buffer = Buffer.from(r.reset, 'hex');
                    } else {
                        console.error(`Expected value at ${r.address} to be ${r.value} or ${r.reset}. Instead found ${purplState[r.name]}`);
                        console.clear();
                        renderer(generatePurplCommands());
                        break;
                    }
                    debug(buffer);
                    mem.writeBuffer(proc.handle, pointer + finalOffset, buffer);
                    console.clear();
                    renderer(generatePurplCommands());
                    break;
                }
                debug('Whats up?')
                if (purplState[r.name] === r.reset.toLowerCase()) {
                    writeMem(r.address, parseInt(r.value, 16), r.dataType);
                } else if (purplState[r.name] === r.value.toLowerCase()) {
                    writeMem(r.address, parseInt(r.reset, 16), r.dataType);
                } else {
                    console.error(`Expected value at ${r.address} to be ${r.value} or ${r.reset}. Instead found ${purplState[r.name]}`);
                }
                renderer(generatePurplCommands());
                break;
            case 'pack':
            renderer(generatePurplCommands());
            case 'back':
            renderer(generatePurplCommands());
        }
    })();
}

function updateState() {
    purplState = config.purpl.reduce(function(acc, r) {
        if (r.dataType === 'pointer') {
            if (! r.offsets) {
                console.error('Data type pointer must have an array of offsets');
            }
            let pointer = ea['dll'].modBaseAddr + parseInt(r.address, 16); 
            debug({pointer: Number(pointer).toString(16)})
            const offsetsCopy = [...r.offsets];
            const finalOffset = offsetsCopy.pop();
            const offsets = [...offsetsCopy.reverse(), 0];
            while (offsets.length > 0) {
                const currentOffset = offsets.pop();
                pointer = parseInt(mem.readBuffer(proc.handle, pointer + currentOffset, 8).toString('hex').match(/../g).reverse().join(""), 16)
                debug({pointer: Number(pointer).toString(16), buffer: mem.readBuffer(proc.handle, pointer, 6)})
            }
            debug({pointer: Number(pointer + finalOffset).toString(16), buffer: mem.readBuffer(proc.handle, pointer + finalOffset, 6)})
            acc[r.name] = mem.readBuffer(proc.handle, pointer + finalOffset, 6).toString('hex');
            return acc;
        }
        acc[r.name] = Number(readMem(r.address, r.dataType)).toString(16);
        return acc;
    }, {})
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
        try {
            proc = mem.openProcess("MCC-Win64-Shipping-WinStore.exe");
        } catch(ex) {
            proc = mem.openProcess("MCC-Win64-Shipping.exe");
        }
        ea['dll'] = getModuleBase()
        debug(ea['dll'].modBaseAddr);
    }
    inputInit();
    // gamepadInit();
    renderer(generatePurplCommands());
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
    ioHook.start();
    ioHook.on('keydown', event => {
        if(event.rawcode == keyboard.checkpoint){
            console.log(chalk.gray('Setting Checkpoint'))
            writeMem(ea["checkpoint"], 1, "byte")
        }
        else if(event.rawcode == keyboard.revert){
            console.log(chalk.grey('Reverting to Checkpoint'))
            writeMem(ea["revert"], 1, "byte")
        }
    });
} 

// function gamepadInit() {
//     gamepad.init()
//     setInterval(gamepad.processEvents, 100);
//     gamepad.on("down", function (id, num) {
//         debug(num);
//         if(num == controller.checkpoint){
//             writeMem(ea["checkpoint"], 1, "byte")
//         }
//         else if(num == controller.revert){
//             writeMem(ea["revert"], 1, "byte")
//         }
//     });
// }

function getModuleBase() {
    return mem.findModule('halo2.dll', proc.th32ProcessID);
}

function writeMem(address, value, type) {
    mem.writeMemory(proc.handle, ea['dll'].modBaseAddr + parseInt(address, 16), value , type);
}

function readMem(address, type) {
    return mem.readMemory(proc.handle, ea['dll'].modBaseAddr + parseInt(address, 16), type);
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

function debug(...args) {
    if (DEBUG) {
        console.debug(...args);
    }
}
