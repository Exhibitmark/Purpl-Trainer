const { setTimeout } = require("timers");

const chalk = require("chalk");
const prompts = require('prompts');
const EventEmitter = require('./EventEmitter');
const { readFile } = require('./file');
const { mappings } = require('./constants');

const { offsets } = readFile('./offsets.json');
const { keyboard } = readFile('./config.json');

class UI {
    constructor(stateEmitter) {
        this.stateEmitter = stateEmitter;
        stateEmitter.on('*', (type, state) => {
            this.setState(state);
        });
        this.events = new EventEmitter();
        this.initialize();
    }

    initialize() {
        if (! this.purplState) {
            console.log("Waiting to connect to halo2.dll...");
            setTimeout(() => this.initialize(), 500);
        } else {
            this.loadInitialMenu();
        }
    }

    setState(purplState) {
        console.clear();
        this.purplState = purplState;
    }

    loadIntro() {
        console.clear();
        console.log(chalk.magenta.bold(String.raw`
         _____    _    _   _____    _____    _      
        |  __ \  | |  | | |  __ \  |  __ \  | |     
        | |__) | | |  | | | |__) | | |__) | | |     
        |  ___/  | |  | | |  _  /  |  ___/  | |     
        | |      | |__| | | | \ \  | |      | |____ 
        |_|       \____/  |_|  \_\ |_|      |______|
                        
        `))
        console.log(chalk.magenta.bold('Close the app by pressing Ctrl+C')+'\n\n');
    }

    async loadInitialMenu() {
        this.loadIntro();
       
        const response = await prompts(
            {
                type: 'select',
                name: 'commands',
                message: chalk.black.bgWhite.bold('Available Commands'),
                choices: [
                    // { title: chalk.bold('Keybinds'),description: chalk.white('Configure bindings'), value: 'keybinds' },
                    { title: chalk.bold('Purpl'), description: chalk.white("Enable Purpl once you're in game"), value: 'enable' },
                    // { title: chalk.bold('Help'), description: chalk.white('Stop it. Get some help'), value:"help"}
                ]
            }
        );

        switch(response.commands) {
            case 'keybinds':
                break;
            case 'enable':
                console.clear();
                await this.loadPurplMenu();
                break;
            case 'help':
                break;
        }
    }

    getTitle(entry) {
        const enabled = this.purplState[entry.name] === entry.value.toLowerCase() || false;
        const keyCode = keyboard[entry.name];
        const key = mappings[keyCode];
        return `${key ? `[${key}] ` : ''}${entry.description} ${enabled ? chalk.green('enabled') : chalk.red('disabled')}`;
    }

    async loadPurplMenu() {
        const purplChoices = offsets.filter(o => ! o.disabled).map(o => ({
            title: this.getTitle(o),
            value: o
        }))
        purplChoices.push({
            title: chalk.bold('Go Back'),
            value: "back",
        });
        const promptsPromise = prompts(
            {
                type: 'select',
                name: 'commands',
                message: chalk.black.bgWhite.bold('Available Commands'),
                choices: purplChoices
            }
        );
        const statePromise = new Promise((resolve) => {
            this.stateEmitter.once('*', () => {
                resolve(false);
            });
        });
        const response = await Promise.race([promptsPromise, statePromise]);
        if (response) {   
            if (response.commands === 'back' || typeof response.commands === 'undefined') {
                console.clear();
                return this.loadInitialMenu();
            }

            this.events.emit(response.commands.name);
        }
        console.clear();
        this.loadPurplMenu();
    }
}

module.exports = UI;