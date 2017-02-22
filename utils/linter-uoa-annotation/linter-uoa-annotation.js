/*jshint esversion:6 */

/**
 * linter-uoa-annotation.js
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 *
 * This utility uses the JSON schema in its directory to validate specified 
 * annotation files in UoA location aware multi-camera person tracking 
 * annotation style.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

// Load the JSON schema object
let schema = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'uoa-annotation-schema.json'))
);

let noError = true;

// Parse and read the given file or directory
let fileList = [];
try {
    let specifiedPath = path.normalize(process.argv[2]);

    if (fs.lstatSync(specifiedPath).isDirectory()) {
        fileList = fs.readdirSync(specifiedPath).map((filename) => {
            return path.join(specifiedPath, filename);
        });
    } else {
        fileList.push(specifiedPath);
    }

    // Filter out non-json files
    fileList = fileList.filter((file) => {
        return path.extname(file) === '.json';
    });

    if (fileList.length === 0) {
        throw new Error('fileList cannot be empty.');
    }
}
catch(e) {
    console.error('No valid JSON file was found at given path or directory');
    throw e;
}

// Run schema validation
let ajv = new Ajv({
    'v5': true,
    'allErrors': true
});
let validate = ajv.compile(schema);
fileList.forEach((file) => {
    let data = JSON.parse(fs.readFileSync(file));
    let valid = validate(data);
    if (!valid) {
        console.warn(`In file ${file}`);
        console.warn(validate.errors);
        
        // Automatic resolution code here
        // validate.errors.forEach((error) => {
        //     if (error.keyword === 'maximum') {

        //     }
        // });

        noError = false;
    }
});

if (noError) {
    console.log('No errors or warnings from checked files.');
}