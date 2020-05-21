const fs = require('fs-extra');
const path = require('path');
const { readFile } = require('../src/file');
const outFolder = path.resolve('new');
const package = readFile(path.resolve('./package.json'));
const archiver = require('archiver')

if (! fs.existsSync(outFolder)) {
    fs.mkdirSync(outFolder);
}

const files = ['offsets.json', 'config.json', 'taskDependents']

files.forEach(file => fs.copySync(path.resolve(file), path.resolve(outFolder, file)));
fs.rename(path.resolve(outFolder, 'Purpl.exe'), path.resolve(outFolder, 'Purpl-' + package.version + '.exe'));

var output = fs.createWriteStream('Purpl-' + package.version + '.zip');
var archive = archiver('zip');

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err){
    throw err;
});

archive.pipe(output);
archive.directory('./new', false);
archive.finalize();