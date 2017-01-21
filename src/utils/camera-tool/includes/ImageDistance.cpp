#include "ImageDistance.hpp"

#include <math.h>

using namespace cv;
using namespace std;

#include <iostream>

ImageDistance::ImageDistance(shared_ptr<LensCalibration> l, shared_ptr<PerspectiveCalibration> p, Point2f o)
{
    this->lens = l;
    this->perspective = p;
    this->setOrigin(o);
}

ImageDistance::~ImageDistance()
{

}

bool ImageDistance::isReady()
{
    return (this->lens && this->perspective && this->lens->isCalibrated() && this->lens->isMapped() && this->perspective->isCalibrated());
}

Point2f ImageDistance::transformCoordinate(Point2f coordinate)
{
    return this->perspective->onPoint(this->lens->onPoint(coordinate));
}

bool ImageDistance::setOrigin(Point2f origin)
{
    if (origin.x >= 0 && origin.y >= 0)
    {
        Point2f transformedOrigin = this->transformCoordinate(origin);

        if (transformedOrigin.x >= 0 && transformedOrigin.y >= 0)
        {
            this->origin = transformedOrigin;
            return true;
        }
    }

    return false;
}

Point2f ImageDistance::getOrigin()
{
    return this->origin;
}

Point2f ImageDistance::getRealCoordinate(Point2f position)
{
    Point2f virtualCoordinates(this->transformCoordinate(position) - this->origin);

    return Point2f(virtualCoordinates.x * this->perspective->getScaleFactor(), virtualCoordinates.y * this->perspective->getScaleFactor());
}

double ImageDistance::getRealDistance(Point2f start, Point2f stop)
{
    Point2f virtualDistance(this->transformCoordinate(stop) - this->transformCoordinate(start));

    return sqrt(((double) virtualDistance.x * (double) virtualDistance.x + (double) virtualDistance.y * (double) virtualDistance.y)) * perspective->getScaleFactor();
}
