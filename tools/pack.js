const fs = require('fs-extra');
const path = require('path');

const outFolder = path.resolve('new');

if (! fs.existsSync(outFolder)) {
    fs.mkdirSync(outFolder);
}

const files = ['offsets.json', 'config.json', 'taskDependents']

files.forEach(file => fs.copySync(path.resolve(file), path.resolve(outFolder, file)));