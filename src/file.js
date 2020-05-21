const fs = require('fs');

function readFile(file) {  
    const f = fs.readFileSync(file);
    return JSON.parse(f);
};

function writeFile(file, content) {  
    fs.writeFile(file, JSON.stringify(content), function (err) {
        if (err) throw err;
        console.log('Config Saved!');
    });
};

module.exports = {
    readFile,
    writeFile,
}