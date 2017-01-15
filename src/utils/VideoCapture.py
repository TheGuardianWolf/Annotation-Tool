#!/usr/bin/env python3

import subprocess
import sys
import string
import os
import pexpect

class Capture:
    initDevices = False
    capturing = False
    processLoaded = False
    captureDevices = [
        "/dev/video1",
        "/dev/video2",
        "/dev/video3",
        "/dev/video0" 
        ]
    captureProcesses = []
    filePath = ""
    filePrefix = ""
    sequenceNumber = ""
    sequenceName = ""
    incrementalNumber = ""

    def init(self):
        if not self.processLoaded:
            if not self.initDevices:
                for i in range(0, len(self.captureDevices)):
                    userDefined = input("Enter camera " + str(i + 1) + \
                                        " device (default " + self.captureDevices[i] + "): ")
                    if len(userDefined) > 0:
                        self.captureDevices[i] = userDefined
                self.filePath = input("Save directory: ")
                if self.filePath[-1] != "/":
                    self.filePath += "/"
                if self.filePath[0] == "~":
                    self.filePath = os.path.expanduser("~") + self.filePath[1:]
                self.initDevices = True

            self.sequenceNumber = input("Sequence number: ")
            self.sequenceName = string.capwords(input("Sequence name: "))
            self.incrementalNumber = input("Incremental number: ")
            self.filePrefix = "S" + self.sequenceNumber + "_" + self.sequenceName + "_" + self.incrementalNumber
        else:
            print("Cannot set settings whilst proccesses are running.")

    def load(self):
        if not self.processLoaded:
            if self.initDevices:
                print("Starting capture processes.")
                self.processLoaded = True
                cmd = [
                    "mkdir",
                    self.filePath + ".tmp"
                ]
                subprocess.run(cmd)
                for i in range(0, len(self.captureDevices)):
                    cmd = [
                        "uvcdynctrl",
                        "--device=" + self.captureDevices[i],
                        " --set=\"Power Line Frequency\" 1"
                    ]
                    print("Running", " ".join(cmd))
                    try:
                        subprocess.check_call(cmd)
                    except subprocess.CalledProcessError:
                        print("Error detected, retrying (usually works).")
                        subprocess.call(cmd)
                    cmd = [
                        "guvcview", 
                        "--device=" + self.captureDevices[i],
                        "--resolution=1920x1080",
                        "--fps=15", 
                        "--format=MJPG",
                        "--audio=none",
                        "--gui=none",
                        "--video_codec=raw",
                        "--render=none",
                        "--render_window=none",
                        "--video=" + self.filePath + ".tmp/" + self.filePrefix + "_C" + str(i + 1) + ".mkv"
                    ]
                    print("Running", " ".join(cmd))
                    self.captureProcesses.append(pexpect.spawn(" ".join(cmd)))
                for process in self.captureProcesses:
                    process.expect("GUVCVIEW: version 2\.0.*")
            else:
                print("Settings not set.")
        else:
            print("Processes have already been loaded.")
            
    def toggle(self):
        if self.processLoaded:
            cmd = ["killall", "-s", "USR1", "guvcview"]
            if not(self.capturing):
                print("Sending capture start command.")
                subprocess.call(cmd)
                for process in self.captureProcesses:
                    process.expect("ENCODER: \(matroska\) add seekhead entry .*")
                self.capturing = True
                print("Capture started.")
            else:
                print("Sending capture stop command.")
                subprocess.call(cmd)
                for process in self.captureProcesses:
                    process.expect("ENCODER: \(matroska\) end duration = .*")
                self.capturing = False
                print("Capture ended.")
                self.save()
        else:
             print("Processes not loaded")

    def kill(self):
        if self.processLoaded:
            if self.capturing:
                self.toggle()
                self.save()
            print("Sending kill command.")
            cmd = ["killall", "-s", "INT", "guvcview"]
            subprocess.call(cmd)
            for process in self.captureProcesses:
                    process.expect("GUVCVIEW Caught signal 2")
            del self.captureProcesses[:]
            self.processLoaded = False
        else:
            print("Processes not loaded")

    def save(self):
        if self.processLoaded:
            if not self.capturing:
                print("Moving files from .tmp folder.")
                for i in range(0, len(self.captureDevices)):
                    cmd = [
                        "mv",
                        self.filePath + ".tmp/" + self.filePrefix + "_C" + str(i + 1) + "-1.mkv",
                        self.filePath + self.filePrefix + "_C" + str(i + 1) + ".mkv"
                    ]
                    subprocess.call(cmd)
                cmd = [
                    "rm",
                    "-rf",
                    self.filePath + ".tmp"
                ]
                subprocess.call(cmd)
            else:
                print("Must end capture before saving.")
        else:
            print("Processes not loaded.")
            
    def menu(self):
        if sys.platform.startswith("linux"):
            print("="*20)
            print("")
            print("Video Capture for IE Room")
            print("")
            print("="*20)
            print("")
            print("Please ensure guvcview-git is installed and cameras 1-4 are connected.")
            while(True):
                print("")
                print("Options:")
                print("1. Set settings.")
                print("2. Load processes.")
                print("3. Toggle capture.")
                print("4. Kill processes.")
                print("5. Exit.")
                print("")
                menuOption = input("Select option (1-5): ")
                if menuOption == "1":
                    self.init()
                elif menuOption == "2":
                    self.load()
                elif menuOption == "3":
                    self.toggle()
                elif menuOption == "4":
                    self.kill()
                elif menuOption == "5":
                    exit()
                else:
                    print("Invalid option.")
        else:
            print("Non Linux platforms are not supported.")

def main():
    capture = Capture()
    capture.menu()


if __name__ == '__main__':
    main();
