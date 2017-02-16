#!/usr/bin/env python3
"""
    Visualise location on a plan view map of the IE room.
    Issues:
        - Only works for single person annotations as it tracks by person array index.
        - Code is not DRY.
"""
import matplotlib.pyplot as plt
import matplotlib.animation as ani
import os
import json

__dirname__ = os.path.dirname(os.path.realpath(__file__))
__currentDir___ = os.getcwd()

# Read floor plan image
floorPlan = plt.imread(os.path.join(__dirname__, 'floor_plan.png'))

# Image coordinates of the room corners
topLeft = (251, 249)
bottomLeft = (251, 2136)
bottomRight = (3083, 2137)
topRight = (3083, 249)

pixelWidth = topRight[0] - topLeft[0]
pixelHeight = bottomLeft[1] - topLeft[1]

pixelWidthRatio = float(pixelWidth) / 6000
pixelHeightRatio = float(pixelHeight) / 4000

annotationPath = os.path.normpath(input('Annotation path (no camera suffix): '))

cameraSuffix = ['_C1', '_C2', '_C3', '_C4']

annotations = []

# Read JSON
for camera in cameraSuffix:
    annotations.append(json.loads(open(annotationPath + camera + '.json').read()))

# Storage for real coordinates
x = []
y = []

# Storage for image coordinates
plotX = []
plotY = []

locationFigures = [];

# Specify person id
personIndex = 0;

# Get data from annotation and store into list (Only supports one person annotations as it tracks by index not id)
for annotationIndex in range(0, len(annotations)):
    locationFigures.append(plt.figure());
    annotation = annotations[annotationIndex]
    for frameIndex in range(0, len(annotation['frames'])):
        frame = annotation['frames'][frameIndex]
        if len(x) <= frameIndex:
            x.append([None] * len(annotations))
        if len(y) <= frameIndex:
            y.append([None] * len(annotations))
        if frame['numberOfPeople'] and frame['people'][personIndex]['location']['real']['x'] and frame['people'][personIndex]['location']['real']['y']:
            x[frameIndex][annotationIndex] = frame['people'][personIndex]['location']['real']['x']
            y[frameIndex][annotationIndex] = frame['people'][personIndex]['location']['real']['y']

for figureIndex in range(0, len(locationFigures)):
    figure = locationFigures[figureIndex]
    plotX = []
    plotY = []
    for numbers in x:
        if numbers[figureIndex]:
            plotX.append(float(numbers[figureIndex]) * pixelWidthRatio + topLeft[0])
    for numbers in y:
        if numbers[figureIndex]:
            plotY.append(float(numbers[figureIndex]) * pixelHeightRatio + topLeft[1])
    plot = figure.add_subplot(111)
    plot.imshow(floorPlan)
    plot.plot(plotX, plotY, 'r-+', linewidth=0.1, markersize=1)
    plot.axis('off')
    figure.savefig(os.path.join(__currentDir__, 'path' + cameraSuffix[figureIndex] + '.png'), dpi = 500)

locationFigures.append(plt.figure());

def averageOf(li):
    sum = 0
    count = 0
    for val in li:
        if val is not None:
            sum += val
            count += 1
    if count > 0:
        return float(sum) / count
    return None

plotX = []
plotY = []

for numbers in x:
    average = averageOf(numbers)
    if average is not None:
        plotX.append(float(average) * pixelWidthRatio + topLeft[0])
for numbers in y:
    average = averageOf(numbers)
    if average is not None:
        plotY.append(float(average) * pixelHeightRatio + topLeft[1])

plot = locationFigures[len(locationFigures) - 1].add_subplot(111)
plot.imshow(floorPlan)
plot.plot(plotX, plotY, 'r-+', linewidth=0.1, markersize=1)
plot.axis('off')
locationFigures[len(locationFigures) - 1].savefig(os.path.join(__dirname__, 'path_all.png'), dpi = 500)


locationFigures.append(plt.figure());
plot = locationFigures[len(locationFigures) - 1].add_subplot(111)
plot.axis('off')
plot.imshow(floorPlan)
graph, = plot.plot([], [], 'r+', linewidth=0.1, markersize=1)

def initAniPath():
    graph.set_data([], [])
    return graph,

def aniPath(i):
    x = plotX[i]
    y = plotY[i]
    graph.set_data(x, y)
    return graph,

animatedPath = ani.FuncAnimation(locationFigures[len(locationFigures) - 1], aniPath, init_func=initAniPath, frames=len(plotX), interval=6.666667, blit=True, dpi = 500)
animatedPath.save(os.path.join(__currentDir__, 'path_all.mp4'), fps=15)