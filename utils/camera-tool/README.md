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

Run the following commands from the project root directory if the automatic 
build fails:

```bash
mkdir build
cd build
cmake ..
make
```

## Usage

The tool accepts a variety of options to perform set tasks. Run the tool in 
a terminal.

```bash
/path/to/build/CameraTool <options> <arg1> <arg2> ...
```

If this does not work, make sure the executable bit is set.

### Extracting video files

Used for extracting the frames from video files.

```bash
/path/to/build/CameraTool -E <source_video> <destination_folder>
```

### Save lens calibration from video to file

Must be run on a video file that contains instances of a checkerboard pattern.

```bash
/path/to/build/CameraTool -E <source_video> <destination_folder>
```

### Apply lens distortion correction to image

Uses OpenCV to compute ideal pixel coordinates for all pixels in an image to 
perform lens distortion correction. Settings preserves edge space.

```bash
/path/to/build/CameraTool -E <source_video> <destination_folder>
```

### Apply lens distortion correction effect on point

Uses OpenCV to compute what would happen to a point on an image if lens 
distortion corrections were made on an image at that point, and returns the 
translated point.

### Save perspective calibration from points to file
Creates perspective calibration files from source points in image space and
the real world size of the planar rectangle specified from the source points.

### Apply perspective distortion correction to image

### Apply perspective distortion correction effect on point

### Calculates the real world coordinates of a point

### Calculates the real distance between two image points

## TODO

* Consider using a better options system in the interface.
