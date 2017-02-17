# Camera-Tool Utility

This tool interfaces with the calibration and distance C++ modules for a range
of purposes, including providing an interface for inferring a coordinate for
the Annotation-Tool using JSON to pass data, and to create the calibration files
from source material.

## Build

### Dependencies

* CMake ^3.1
* gcc or clang with C++14 support
* OpenCV ^3.1

Note that if you build with dynamic libraries, the utility will have runtime 
dependencies on those libraries.

### Instructions

**Automatic**

This utility should have been built along with the ```npm install``` command in 
the project root directory. The output is in the 
```/path/to/Annotation-Tool/build``` directory.

**Manual**

Run the following commands if the automatic build fails, from the project root 
directory:

```bash
mkdir build
cd build
cmake ..
make
```

## Usage

The script can be called by the following shell commands:

```bash
/path/to/this/folder/visualise_location.py
```

From there, the script will prompt for a filepath to your annotation files 
without the camera suffix or extension. The annotation files must follow the 
conventions of the dataset. Specified files must exist and be valid annotations 
for this to work.

```
Annotation path (no camera suffix): /path/to/annotations/SX_Name_00X
```

Generated images and video will be placed in your current working directory.

## Changes

### Interface

### Modules

## TODO

* Use a better options system in the interface.
