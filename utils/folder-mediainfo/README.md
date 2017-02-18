# Folder-Mediainfo Utility

This utility runs mediainfo on videos inside a folder to determine their total
length.

## Dependencies

* Node.js ^6.9
* Mediainfo CLI ^0.7.92

## Usage

First run ```npm install``` inside this folder.

The script can be called by the following shell commands:

```bash
node /path/to/this/folder/folder-mediainfo.js <video_folder>
```

The total length will be output to the shell.

## Changes

Find the ```folder-mediainfo.js``` file in this folder and start editing with
any text editor.

Changes can be made to extract any relevant information reported by mediainfo.
