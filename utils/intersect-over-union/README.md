# Intersect Over Union Utility

This utility compares two seperate annotation files and reports on the ratio of
overlap between the bounding box intersection area to the union area.

## Dependencies

* Node.js ^6.9

## Usage

First run ```npm install``` inside this folder.

Annotations must be in UoA annotation format.

The script can be called by the following shell commands:

```bash
node /path/to/this/folder/intersection-over-union.js <reference> <target>
```

The mean, max and min scores will be output to the shell.

## Changes

Find the ```intersect-over-union.js``` file in this folder and start editing with
any text editor.
