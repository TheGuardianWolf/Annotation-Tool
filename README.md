# Annotation-Tool

Created by Jerry Fan, property of The University of Auckland. Licenced under 
the Artistic Licence 2.0.

Submit an issue or pull request for bugfixes. Fork for feature additions.

## Purpose
The Annotation-Tool is made for the annotation of a location aware person 
tracking dataset for multi-camera person tracking. It is intended to produce 
JSON annotations containing ground truth data for each frame in videos from the 
dataset. Annotation types are bounding boxes and location markers for 
image-space and real-world, along with options for the obscured flag and zones.

## Application Platform

The application is built on top of the Node.js platform, making it easily 
extensible with a wide range of npm packages. The core of the application is 
built with AngularJS, a component model based UI framework and Typescript. The 
webpack build system is used to transpile the code to standard (ES5) Javascript 
for greater compatiblity. Electron is used to package the application and 
provide access to the host system's native APIs.

## Utilities

With this tool comes six utilities that can be used as standalone tools to help 
with various annotation tasks. These can be found in the utils folder if you 
download the source code package.

* Camera-Tool
* Capture-Tool
* Folder-Mediainfo
* Intersect-Over-Union
* Linter-UoA-Annotation
* Visualise-Location

## Usage

Grab the latest release for your system from [Releases](https://github.com/TheGuardianWolf/Annotation-Tool/releases).

After installing the package, open the Annotation-Tool from the install 
directory.

### Using the Calibration Samples

The calibration samples are available at ```samples/calibration/```.

These calibration files were created using the calibration sequences available 
in the dataset. A video set is provided for lens calibration, whilst an image 
set is provided for perspective calibration. Points that were used for the 
pre-existing calibration (markup) files are stored in a text file in the 
calibration folder. 

To create your own calibration files, follow the intructions at 
[samples/README.md](https://github.com/TheGuardianWolf/Annotation-Tool/tree/master/samples/README.md).

### Annotations

**General Instructions**

Some annotation steps may be specific to annotate the UoA dataset.

1. To start annotations, open the application and select the annotation option. 
2. On the next screen, either create the project directory if it is a new 
annotation, or load an existing project directory.
3. Workspace will be created (frames extracted) / loaded into the application.
4. Supply the calibration control panel with the calibration files by using the 
file selection input on the right side of the frame-canvas.
5. Supply the image origin by clicking on the "Select Origin" button and 
clicking on the wall corner.
6. Proceed to the annotations tab on the control panel.
7. Annotate frames using the annotation controls, drawing bounding boxes and 
placing location markers. Real-world location will be automatically generated 
from image-space locations if the location tool is used.
8. Proceed to the next frame with the right arrow or 'x' key. Current 
annotations are set to automatically be copied on to the next frame (this can 
be changed from the settings tab).
9. Use the save button on the top right of the annotation workspace when done.

**Bounding Box Interpolation**

To use this feature, add a bounding box to the current frame, and with the copy 
box setting enabled, advance the frame one by one until the next keyframe, and 
position the box. Afterwards, click the _INTERPOLATE_ button. The frames 
between the current frame and the last keyframe will have their boxes adjusted 
automatically.

**Infer Real Location**

This feature automatically triggers whenever the location marker tool is used 
provided that the calibration files are specified. However, if you manually 
enter in the image-space coordinates, then you must use the _AUTOCOODINATE_ 
button. 

**Tips for Workflow**

* Annotate ONLY the bounding box or location for ONE person at a time, going 
back to annotate the next element.
* Use the automatic bounding box interpolation every few frames, a rule of 
thumb is every 3 to 5 frames depending on the action sequence.
* Avoid automatic interpolation when the target is constantly going in and out 
of view.
* Use the location mode when annotating locations, as it allows rapid fire 
clicking of locations with auto frame advancement.

**Settings**

_Copy Boxes_

Copies the bounding boxes from the current frame to the next if advancing by one 
frame at a time.

_Copy Location_

Copies the location points from the current frame to the next if advancing by 
one frame at a time.

_Annotation Mode_

Use either the mixed annotation mode or the location mode depending on the 
current annotation task. Location mode is optimised for quickly dropping 
location markers.

**Shortcuts**

_Mode Selection_

```
1 - Mixed annotation mode
2 - Location annotation mode 
```

_Tool Selection_

```
e - Pointer
r - Box
t - Location
```

_Frame Navigation_

```
z - Previous frame
x - Next frame
```

_Semi-Auto Annotation_

```
d - Interpolate bounding boxes
f - Automatically infer real location
```

### Utilities GUI Interface

Currently unavailable (See #TODO).

## Development

Make sure you have the Camera-Tool dependencies installed and in your PATH. For 
more information on development with the Camera-Tool, a readme is available at 
[utils/camera-tool/README.md](https://github.com/TheGuardianWolf/Annotation-Tool/blob/master/utils/camera-tool/README.md).

Make sure you have Node.js installed and in your PATH.

Clone the git repository and run ```npm install``` inside the directory. 
Node development tools will be automatically installed.

### Dependencies

* Node.js ^6.9
* Camera-Tool
    * CMake ^3.1
    * C++ compiler with C++14 support
    * OpenCV ^3.1

### NPM Scripts

A few npm scripts are provided for ease of use.

```bash
# Installs all dependencies and runs postinstall builds
npm install

# Runs cmake-js
npm run cmake

# Builds with webpack
npm build

# Builds with webpack in watch mode
npm build:watch

# Packages with electron-packager for Win32
npm run package:win32

# Packages with electron-packager for Linux
npm run package:linux

# Runs electron
npm start
```

### Build System

Webpack 1 is the current build tool in use. Its configuration can be found 
in ```webpack.config.js```. Source files used for Webpack build are located 
in ```src/```.

Typescript and AngularJS 2 are used for application components/modules.

For more information on AngularJS with Typescript, see [AngularJS 2 
Typescript](https://angular.io/docs/ts/latest/).

### Main Application

Electron runs two processes when started, the main process and the renderer 
process. All Electron windows run in the renderer process, and are created from 
the main process.

```
# Main Process Code
src/main.electron.js

# Renderer Code
src/main.renderer.ts
```

The application is split into modules, each with one or more components. 
Bootstrapping AngularJS is done in the renderer code file, along with 
initialising the loading screen.

### Application Modules

**AppModule**

Located in ```src/app/```.

This module glues the other application modules together, along with 
initialising the router for navigation.

**AnnotatorModule**

Located in ```src/app/annotator/```.

Contains the FrameCanvas component and module along with ControlPanel 
components.

This module basically contains all the visual controls for the annotator 
workspace. This involves functions such as the keyboard shortcuts, and bindings 
to the annotation that gets loaded into the app.

**HubStartModule**

Located in ```src/app/hub-start/```.

Presents options to choose either to do annotations or to use the utilities 
included in the package.

**HubWorkspaceModule**

Located in ```src/app/hub-workspace/```.

Presents options to choose either to create an annotation workspace or to load 
it from an existing workspace.

**SharedModule**

Located in ```src/app/shared/```.

Contains shared components such as non-angular classes, material components, 
Angular Services.

Of note is the workspace service, which contains much of the application state 
for the annotation workspace.

## TODO

* Add error or info messages to alert users. This can be done using the 
material framework currently installed
* Enable the use of StatusComponent to notify user that the app is busy with 
something async
* Create components for each of the material inputs, or switch to a different 
Angular 2 based material package
* Let the StatusComponent control the loading screen based on blocking status
* Make the room size information part of the calibration information, rather 
than being hard coded in the application
* Upgrade build tool to Webpack 2
* Refactor the frame box and location copy function to not trigger on frame 
navigator change (currently copies data if frame is advanced by one using the 
navigator)
* Refactor the frame-canvas component if possible into smaller components.
* Automate builds further using Node ENV to set AngularJS 2 production mode 
during buildtime
* Create alternative build for sever-client environment using AngularJS 
Universal
* Fix the node bindings for the Camera-Tool so that it can be better 
integrated into the application
* Create interface for the utilities in ```./utils``` using TerminalJS and 
enable the disabled option in HubStartComponent
