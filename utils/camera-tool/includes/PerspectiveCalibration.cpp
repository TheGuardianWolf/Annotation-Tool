/**
 * PerspectiveCalibration.cpp
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 */

#include "PerspectiveCalibration.hpp"

#include <iostream>

#include <opencv2/core/utility.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/calib3d.hpp>
#include <opencv2/imgcodecs.hpp>

using namespace cv;
using namespace std;

PerspectiveCalibration::PerspectiveCalibration()
:calibrated(false),
scaleFactor(0)
{

}

PerspectiveCalibration::PerspectiveCalibration(string filePath)
:calibrated(false),
scaleFactor(0)
{
    this->fromFile(filePath);
}

PerspectiveCalibration::PerspectiveCalibration(vector<Point2f>& original, vector<Point2f>& transformed, double scaleFactor)
:calibrated(false),
scaleFactor(0)
{
    this->fromPoints(original, transformed, scaleFactor);
}

PerspectiveCalibration::PerspectiveCalibration(vector<Point2f>& original, Point2f trueSize)
:calibrated(false),
scaleFactor(0)
{
    this->fromPoints(original, trueSize);
}

PerspectiveCalibration::PerspectiveCalibration(vector<Point2f>& original, Point2f trueSize, Point2f translation)
:calibrated(false),
scaleFactor(0)
{
    this->fromPoints(original, trueSize, translation);
}

bool PerspectiveCalibration::isCalibrated()
{
    return this->calibrated && this->scaleFactor > 0;
}

bool PerspectiveCalibration::performTransform()
{
    this->transform = getPerspectiveTransform(this->ptsSrc,this->ptsDst);

    if (!this->transform.empty())
    {
        this->calibrated = true;

        return true;
    }

    return false;
}

bool PerspectiveCalibration::setScaleFactor(double sf)
{
    if (sf > 0)
    {
        this->scaleFactor = sf;
        return true;
    }

    return false;
}

double PerspectiveCalibration::getScaleFactor()
{
    return this->scaleFactor;
}

vector<Point2f> PerspectiveCalibration::estimateTransformed(vector<Point2f>& original, Point2f trueSize, Point2f translation) // width : height
{
    vector<Point2f> buf;

    if (original.size() == 4)
    {
        double leftLength = fabs(original[2].y - original[0].y);
        double rightLength = fabs(original[3].y - original[1].y);

        double width;
        double height;

        // Figure out which side of the quadrilateral has the smallest vertical
        // distance and use it as the corrected height.
        height = rightLength < leftLength ? rightLength : leftLength;

        // Automatically generate a correct width with the correct size ratio of
        // the real size of the planar rectangle.
        width = ( height / trueSize.y ) * trueSize.x;

        // Figure out the scale factor from the heights.
        this->setScaleFactor(trueSize.y / height);

        // Create the coordinates of the corrected rectangle based on the
        // generated width and height.
        buf.emplace_back(original[0].x + translation.x, original[0].y + translation.y);
        buf.emplace_back(original[0].x + width + translation.x, original[0].y + translation.y);
        buf.emplace_back(original[0].x + translation.x, original[0].y + height + translation.y);
        buf.emplace_back(original[0].x + width + translation.x, original[0].y + height + translation.y);
    }

    return buf;
}

bool PerspectiveCalibration::fromPoints(vector<Point2f> &original, vector<Point2f> &transformed, double scaleFactor)
{
    if (original.size() == 4 && transformed.size() == 4 && this->setScaleFactor(scaleFactor))
    {
        this->ptsSrc = original;
        this->ptsDst = transformed;

        return this->performTransform();
    }

    return false;
}

bool PerspectiveCalibration::fromPoints(vector<Point2f> &original, Point2f trueSize)
{
    return this->fromPoints(original, trueSize, Point2f(0,0));
}

bool PerspectiveCalibration::fromPoints(vector<Point2f> &original, Point2f trueSize, Point2f translation)
{
    vector<Point2f> transformed = this->estimateTransformed(original, trueSize, translation);

    if (transformed.size() == 4)
    {
        return this->fromPoints(original, transformed, this->scaleFactor);
    }

    return false;
}

bool PerspectiveCalibration::fromFile(string filePath)
{
    FileStorage fs(filePath, FileStorage::READ);

    if (fs.isOpened())
	{
        fs["scale_factor"] >> this->scaleFactor;
        fs["original_points"] >> this->ptsSrc;
        fs["transformed_points"] >> this->ptsDst;
        fs["perspective_transformation"] >> this->transform;

        fs.release();

        this->calibrated = true;

        return true;
    }

    return false;
}

bool PerspectiveCalibration::store(string filePath)
{
    if (this->calibrated)
    {
        FileStorage fs( filePath, FileStorage::WRITE );

        if (fs.isOpened())
        {
            fs << "scale_factor" << this->scaleFactor;
            fs << "original_points" << this->ptsSrc;
            fs << "transformed_points" << this->ptsDst;
            fs << "perspective_transformation" << this->transform;

            fs.release();

            return true;
        }
    }

    return false;
}

bool PerspectiveCalibration::onImage(string imagePath, Mat& fixedImage)
{
    if (this->calibrated)
    {
        Mat rawImage;

        rawImage = imread(imagePath);

        if (rawImage.empty())
        {
            cout << "Image could not be read: " << imagePath << endl;
            return false;
        }

        // Fix distortion
        warpPerspective(rawImage, fixedImage, this->transform, rawImage.size());

        return true;
    }

    return false;
}

Point2f PerspectiveCalibration::onPoint(const cv::Point2f& point)
{
    if (point.x >= 0 && point.y >= 0 && this->calibrated)
    {
        vector<Point2f> src(1, point);
        vector<Point2f> dst;

        perspectiveTransform(src, dst, this->transform);

        if (dst.size())
        {
            return dst[0];
        }
    }

    return Point2f(-1, -1);
}
