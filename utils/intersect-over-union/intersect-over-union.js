/*jshint esnext:true, esversion:6 */

/**
 * intersect-over-union.js
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 *
 * This utility compares two seperate annotation files and reports on the ratio of
 * overlap between the bounding box intersection area to the union area.
 */

const fs = require('fs');
const rect = require('rectangles');

// Read in the JSON files.
let reference = JSON.parse(fs.readFileSync(process.argv[2]));
let target = JSON.parse(fs.readFileSync(process.argv[3]));

let scores = [];

reference.frames.forEach((referenceFrame, index) => {
	let targetFrame = target.frames[index];

	// Check that box annotations exist in both files for the frame.
	if (referenceFrame.people[0] &&
		targetFrame.people[0] &&
		referenceFrame.people[0].box &&
		targetFrame.people[0].box) {
		let targetBox = targetFrame.people[0].box;
		let referenceBox = referenceFrame.people[0].box;

		let targetRect = {
			'x1': targetBox.topLeft.x,
			'y1': targetBox.topLeft.y,
			'x2': targetBox.bottomRight.x,
			'y2': targetBox.bottomRight.y
		};

		let referenceRect = {
			'x1': referenceBox.topLeft.x,
			'y1': referenceBox.topLeft.y,
			'x2': referenceBox.bottomRight.x,
			'y2': referenceBox.bottomRight.y
		};

		let intersection = 0;
		// Get intersection rectangle if they intersect.
		if (rect.intersect(targetRect, referenceRect)) {
			intersection = rect.intersection(
				targetRect,
				referenceRect
			);
		}

		// Calculate area of intersection.
		let overlap = rect.area(intersection);

		// Calculate the total union area of the boxes.
		let union = rect.area(targetRect) + rect.area(referenceRect) - overlap;

		// Save intersect over union.
		scores.push(overlap / union);
	}
});

// Sum the scores.
let totalScore = scores.reduce((prev, curr, index) => {
	return prev + curr;
});

// Calculate the average score.
let averageScore = totalScore / scores.length;

console.log(`Average score over ${scores.length} frames is ${averageScore}.`);
console.log(`Maximum score is ${Math.max(...scores)}.`);
console.log(`Minimum score is ${Math.min(...scores)}.`);
