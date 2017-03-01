# Camera-Tool Utility

Created by Jerry Fan, property of The University of Auckland. Licenced under 
the Artistic Licence 2.0.

This tool interfaces with the calibration and distance C++ modules for a range
of purposes, including providing an interface for inferring a coordinate for
the Annotation-Tool using JSON to pass data, and to create the calibration files
from source material.

## Build

### Dependencies

* CMake ^3.1
* C++ compiler with C++14 support
* OpenCV ^3.1

Note that if you build with dynamic libraries, the utility will have runtime 
dependencies on those libraries.

### Instructions

**Automatic**

This utility should have been built along with the ```npm install``` command in 
the project root directory. The output is in the ```/path/to/Annotation-Tool/build``` directory.

**Manual**

Run the following commands from the project root directory if the automatic 
build fails:

```bash
mkdir build
cd build
cmake ..

# Linux
make

# Windows
msbuild
```

## Usage

The tool accepts a variety of options to perform set tasks. Run the tool in 
a terminal.

```bash
/path/to/build/CameraTool <options> <arg1> <arg2> ...
```

If this does not work, make sure the executable bit is set.

### Runtime Dependencies
The following libraries are required in linux if you are running the default 
build.

```
libhdf5 libbz2 libjpeg libwebp libpng libtiff libjpeg libwebp libpng libtiff libImath libIlmImf libIex libHalf libIlmThread libgtk-3 libgdk-3 libpangocairo-1.0 libpango-1.0 libatk-1.0 libcairo-gobject libcairo libgdk_pixbuf-2.0 libgio-2.0 libgobject-2.0 libglib-2.0 libgthread-2.0 libglib-2.0 libgthread-2.0 libdc1394 libxine libv4l1 libv4l2 libavcodec libavformat libavutil libswscale libavresample libtbb
```

If an opencv package exists for your distribution, that may be installed to 
provide these dependencies.

### Extracting video files

Used for extracting the frames from video files.

```bash
/path/to/build/CameraTool -E <video_path> <output_folder_path>
```

### Save lens calibration from video to file

Must be run on a video file that contains instances of a checkerboard pattern.

```bash
/path/to/build/CameraTool -Lf <video_path> <output_markup_path> <frames>
```

### Apply lens distortion correction to image

Uses OpenCV to compute ideal pixel coordinates for all pixels in an image to 
perform lens distortion correction. Settings preserves edge space.

```bash
/path/to/build/CameraTool -Li <input_image_path> <output_image_path> <lens_calibration_file>
```

### Apply lens distortion correction effect on point

Uses OpenCV to compute what would happen to a point on an image if lens 
distortion corrections were made on an image at that point, and returns the 
translated point.

```bash
/path/to/build/CameraTool -Lp <point_x> <point_y> <lens_calibration_file>
```

### Save perspective calibration from points to file
Creates perspective calibration files containing a homography to map the camera
view to a top down view from source points in image space and the real world 
size of the planar rectangle specified from the source points. 

**Note:** The source points should have been pre-processed using the lens 
distortion correction functions.

```bash
/path/to/build/CameraTool -Pf <top_left_x> <top_left_y> <top_right_x> <top_right_y> <bottom_left_x> <bottom_left_y> <bottom_right_x> <bottom_right_y> <ratio_x> <ratio_y> <output_markup_path>
```

### Apply perspective distortion correction to image
Uses OpenCV to apply the homography contained in the calibration file to an 
image.

**Note:** The source image should have been pre-processed using the lens 
distortion correction functions.

```bash
/path/to/build/CameraTool -Pi <input_image_path> <output_image_path> <perspective_calibration_file>
```

### Apply perspective distortion correction effect on point
Uses OpenCV to apply the homography contained in the calibration file to a 
point.

**Note:** The point should have been pre-processed using the lens 
distortion correction functions.

```bash
/path/to/build/CameraTool -Pp <point_x> <point_y> <perspective_calibration_file>
```

### Calculates the real world coordinates of a point
Uses lens distortion correction and perspective distortion correction on the 
supplied point to convert an image-space point to a real-world point based on 
the supplied calibration files and the origin point.

```bash
/path/to/build/CameraTool -Ip <point_x> <point_y> <origin_x> <origin_y> <lens_calibration_file> <perspective_calibration_file>
```

### Calculates the real distance between two image points
Uses lens distortion correction and perspective distortion correction on the 
supplied points to convert an image-space distance to a real-world distance 
based on the supplied calibration files.

```bash
/path/to/build/CameraTool -Id <start_x> <start_y> <end_x> <end_y> <lens_calibration_file> <perspective_calibration_file>
```

## TODO

* Consider suppling an interactive interface.
