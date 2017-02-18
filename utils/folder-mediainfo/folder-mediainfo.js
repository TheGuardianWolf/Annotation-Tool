/*jshint esnext:true, esversion:6 */

/**
 * intersect-over-union.js
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 *
 * This utility runs mediainfo on videos inside a folder to determine their total
 * length.
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const parser = require('xml2json');
const fileType = require('file-type');
const readChunk = require('read-chunk');
const juration = require('juration');

let folder = path.normalize(process.argv[2]);
let directoryContents = fs.readdirSync(folder);

let fileInfo = [];
let mediainfoPromises = [];
let totalDuration = 0;

// Filter out non video file types.
directoryContents.filter((file, index) => {
    console.log(`Applying filter to file ${index + 1} out of ${directoryContents.length}.`);
    let filePath = path.join(folder, file);
    let isVideo = fileType(readChunk.sync(filePath, 0, 4100)).mime.split('/')[0] === 'video';
    if (!isVideo) {
        console.log(`${file} is not a video and was filtered out.`);
    }
    return isVideo;
})
// Run mediainfo on each video file and store results.
.forEach((file, index, videoList) => {
    console.log(`Processing file ${index + 1} out of ${videoList.length}.`);
    let filePath = path.join(folder, file);
    let xml = child_process.execSync(`mediainfo --Output=XML ${filePath}`);
    fileInfo.push(parser.toJson(xml, {
        'object': true
    }));
});

// Extract the general track information from the mediainfo xml output.
fileInfo.map((info) => {
    return info.Mediainfo.File.track.filter((track) => {
        return track.type === 'General';
    })[0];
})
// From each track, get the duration and add it to the total.
.forEach((track) => {
    if (track) {
        if (track.Duration) {
            totalDuration += juration.parse(track.Duration);
        }
    }
});

console.log(`Total duration of videos in folder: ${juration.stringify(totalDuration)}`);
