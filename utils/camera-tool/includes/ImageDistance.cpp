/**
 * ImageDistance.cpp
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 */

#include "ImageDistance.hpp"

#include <math.h>
#include <iostream>

using namespace cv;
using namespace std;

ImageDistance::ImageDistance(shared_ptr<LensCalibration> l, shared_ptr<PerspectiveCalibration> p)
{
    this->lens = l;
    this->perspective = p;
	this->origin = Point2f(0, 0);
}

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
    return (this->lens && this->perspective && !this->origin.isEmpty() && this->lens->isCalibrated() && this->lens->isMapped() && this->perspective->isCalibrated());
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
	if (this->isReady())
	{
		Point2f virtualCoordinates(this->transformCoordinate(position) - this->origin);

		return Point2f(virtualCoordinates.x * this->perspective->getScaleFactor(), virtualCoordinates.y * this->perspective->getScaleFactor());
	}
	return Point2f;
}

double ImageDistance::getRealDistance(Point2f start, Point2f stop)
{
	if (this->isReady())
		Point2f virtualDistance(this->transformCoordinate(stop) - this->transformCoordinate(start));

		return sqrt(((double) virtualDistance.x * (double) virtualDistance.x + (double) virtualDistance.y * (double) virtualDistance.y)) * perspective->getScaleFactor();
	}
	return -1.0;
}
