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
const normalise = require('ajv-error-messages');
const prompt = require('prompt-sync')();

// Load the JSON schema object
let schema = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'uoa-annotation-schema.json'))
);

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
} catch (e) {
    process.stderr.write('No valid JSON file was found at given path or directory');
    throw e;
}

// Run schema validation
let ajv = new Ajv({
    'v5': true,
    'allErrors': true
});

let errors = [];

let validate = ajv.compile(schema);
fileList.forEach((file, index) => {
    let annotation = JSON.parse(fs.readFileSync(file));
    let valid = validate(annotation);
    if (!valid) {
        process.stdout.write(`Failed validation: ${file}\n`);
        errors.push({
            'file': file,
            'annotation': annotation,
            'errors': validate.errors
        });
    }
});

// Function to prompt user for yes or no
let promptBoolean = (message, def) => {
    process.stdout.write(message);
    let input = prompt();
    if (input === 'y' || input === 'Y') {
        return true;
    }
	else if (input === 'n' || input === 'N') {
		return false;
	}
	
    if (def) {
        return true;
    }
    return false;
};

if (errors.length === 0) {
    process.stdout.write('No errors or warnings from checked files.');
} else {
    let unresolvedErrors = [];

    if (promptBoolean('\nErrors present in files, attempt to resolve? (y/N)\n')) {
        // Automatic resolution code here
        errors.forEach((errorList, errorListIndex) => {
            let file = errorList.file;
            let annotation = errorList.annotation;
            errorList.errors.forEach((error, index) => {
                let resolved = false;
                /*jshint -W061 */
                // Can resolve limit errors by bringing value within limits.

                let dataValue = String(eval(`annotation${error.dataPath}`));

                let correction;

                if (/^(maximum|minimum)$/.test(error.keyword)) {

                    switch (error.params.comparison) {
                        case '<=':
                            correction = error.params.limit;
                            break;
                        case '<':
                            correction = error.params.limit - 1;
                            break;
                        case '>=':
                            correction = error.params.limit;
                            break;
                        case '>':
                            correction = error.params.limit + 1;
                            break;
                        default:
                            break;
                    }
                } else if (/^constant$/.test(error.keyword)) {
                    // TODO
                }

                if (typeof correction !== 'undefined') {
                    process.stdout.write(`In file ${file}\n`);
                    process.stdout.write(`Error details: ${JSON.stringify(normalise([error]).fields, null, 4)}\n`);
                    process.stdout.write(`Data value: ${dataValue}\n`);
                    if (promptBoolean('Try to resolve? (n/Y)\n', true)) {
                        eval(`annotation${error.dataPath} = ${correction}`);
                        fs.writeFileSync(file, JSON.stringify(annotation, null, 4));
                        process.stdout.write(`Corrected to: ${correction}\n\n`);
                        resolved = true;
                    }
                }
                /*jshint +W061 */

                if (!resolved) {
                    if (!unresolvedErrors[errorListIndex]) {
                        unresolvedErrors[errorListIndex] = {
                            'errors': [],
                            'file': errorList.file,
                            'annotation': errorList.annotation
                        };
                    }
                    unresolvedErrors[errorListIndex].errors.push(error);
                }
            });
        });
    } else {
        unresolvedErrors = errors;
    }

    if (unresolvedErrors.length > 0) {
        let output = '';

        unresolvedErrors.forEach((errorList) => {
            let buffer = '';
            if (errorList.errors && errorList.errors.length > 0) {
                let normalisedError = normalise(errorList.errors);
                buffer += `In file ${errorList.file}\n`;
                if (Object.keys(normalisedError.fields).length > 1) {
                    buffer += JSON.stringify(normalisedError, null, 4) + '\n\n';
                }
                output += buffer;
            }
        });

        if (output.length > 0) {
            let writePath = path.join(process.cwd(), 'annotation-errors.txt');
            fs.writeFileSync(writePath, output);
            process.stdout.write(`Unresolved errors placed in ${writePath}.`);
        }
    }
}