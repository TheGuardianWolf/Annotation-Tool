# Capture-Tool Utility

The Capture-Tool is python script that utilizes the Linux guvcview-git 
application in a subprocess to control the webcams over the uvc driver 
interface.

Currently only has Linux support, and is specialised for the IE room PC.

## Dependencies

* Python ^3.5
* pexpect ^4.2.1
* guvcview-git latest
* uvcdynctrl unknown (Depends on Linux OS)

## Usage

The script can be called by the following shell commands:

```bash
/path/to/this/folder/capture_tool.py
```

The script has a built in CLI menu that will prompt you for relevant details.

### Menu Options

**1. Set settings.**

Option to enter in variables for device settings, naming purposes and save 
directory. Make sure the default camera /dev/videoX aliases are correct. If 
not, change them through this option.

Settings cannot be set whilst processes are loaded.

**2. Load processes.**

Sets 50Hz power line frequency in camera device firmware through uvcdynctrl, 
then opens the guvcview processes with the following settings:

| Guvcview Setting | Value            |
| ---------------- | ---------------- |
| Resolution       | 1920x1080        |
| FPS              | 15               |
| Format           | MJPG             |
| Audio            | none             |
| Video Codec      | raw              |
| Render           | none             |
| Render Window    | none             |
| Video            | user set         |

**3. Toggle capture.**

This option sends USR1 signals to all opened guvcview instances, starting or 
stopping recording based on 
their current state.

On capture start, a ```.tmp``` folder is created inside the save directory.

On capture end, the videos in the ```.tmp``` folder will be renamed according 
to the set variables and moved into the save directory.

**4. Kill processes.**

This option sends INT signals to all opened guvcview instances, effectively 
ending the processes. Also stops capture if it is ongoing and saves.

**5. Exit.**

Ensures processes are killed and exits.

### Issues 

Using this tool disables the guvcview GUI for next launch, it must be manually
set to launch with GUI through a terminal if it is required.

See [Capture-Tool#TODO](#TODO) for solution.

## Changes

Find the ```capture_tool.py``` file in this folder and start editing with any 
text editor.

## TODO

* Use a seperate control profile file that is passed in through the command 
line to control guvcview settings
* Find an API to control the webcam drivers in Windows