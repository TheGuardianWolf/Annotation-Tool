# Visualise Location Utility

This python 3 utility generates a visual plan-view animation of a person walking through the room using annotation data from specified views of a video set to compensate for obscured views. When more than one view has a location, the location points are an average of available points. A red dot indicates the person moving through the room. It uses the matplotlib library to animate and plot points.

## Dependencies

* Python ^3.5
* Matplotlib ^2.0.0

## Usage

The script can be called by the following shell commands:

```bash
/path/to/this/folder/visualise_location.py
```

From there, the script will prompt for a filepath to your annotation files without the camera suffix or extension. 
The annotation files must follow the conventions of the dataset. Specified files must exist and be valid annotations for this to work.

```
Annotation path (no camera suffix): /path/to/annotations/SX_Name_00X
```

Generated images and video will be placed in your current working directory.

## Changes

Find the ```visualise_location.py``` file in this folder and start editing with any text editor.

## TODO

* Track person identity by person id instead of index in person array to prevent issues in multi-person annotations
* Make proper user interface
* Add options for camera views used
* Add trail and smoother animation effects (perhaps outside the scope of Matplotlib)