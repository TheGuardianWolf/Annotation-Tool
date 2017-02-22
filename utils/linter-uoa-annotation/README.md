# Linter-UoA-Annotation Utility

Created by Jerry Fan, property of The University of Auckland. Licenced under 
the Artistic Licence 2.0.

This utility uses the JSON schema in its directory to validate specified 
annotation files in UoA location aware multi-camera person tracking annotation 
style.

## Dependencies

* Node.js ^6.9

## Usage

The script can be called by the following shell commands:

```bash
node /path/to/this/folder/linter-uoa-annotation <file_or_folder_path>
```

If a file is specified, it will check for a JSON extension and attempt to parse 
it. Otherwise, it will search in a directory for files with JSON extension and 
attempt to parse it.

### Issues 

This tool does not verify all data relationships due to JSON schema limitations.

* In the people annotations, linked to entries are not verified to be doubly 
linked
* In the video annotations, the frame array is not verified to contain all 
frame numbers between the smallest frame number and the largest

See [Linter-UoA-Annotation#TODO](#TODO) for solution.

## Changes

Find the ```linter-uoa-annotation.js``` file in this folder and start editing 
with any text editor.

Additionally, the schema file must be edited if the annotation scheme changes, 
which is located at ```uoa-annotation-schema.json```.

## TODO

* Write custom resolver for easy to fix errors and prompt user to fix
* Custom error messages are required for clarity
* Run pre-validation on the linted files or write custom keywords for ajv to 
extend the schema validation to solve issues.