/**
 * ImageDistance.hpp
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 *
 * This module uses objects from the LensCalibration and PerspectiveCalibration
 * module to convert real distances from image distances.
 */

#ifndef IMAGEDISTANCE_H
#define IMAGEDISTANCE_H

#include "LensCalibration.hpp"
#include "PerspectiveCalibration.hpp"

#include <memory>
#include <opencv2/core.hpp>


class ImageDistance
{
private:
    cv::Point2f origin;
    std::shared_ptr<LensCalibration> lens;
    std::shared_ptr<PerspectiveCalibration> perspective;
    cv::Point2f transformCoordinate(cv::Point2f coordinate);

public:
    ImageDistance(std::shared_ptr<LensCalibration> l, std::shared_ptr<PerspectiveCalibration> p);
    ImageDistance(std::shared_ptr<LensCalibration> l, std::shared_ptr<PerspectiveCalibration> p, cv::Point2f o);
    ~ImageDistance();

    /**
     * Check if ImageDistance object is ready for use.
     * @return True or False for readiness.
     */
    bool isReady();

    /**
     * Set origin of the object after transforming it based on the lens and
     * perspective calibrations.
     * @param  origin Origin point in image space.
     * @return        If set was successful or rejected.
     */
    bool setOrigin(cv::Point2f origin);

    /**
     * Get the currently set origin point from the object.
     * @return Transformed origin.
     */
    cv::Point2f getOrigin();

    /**
     * Transforms a specified image space coordinate into a real world based
     * coordinate, with the specified origin in this object.
     * @param  position Image space coordinate.
     * @return          Transformed coordinate.
     */
    cv::Point2f getRealCoordinate(cv::Point2f position);

    /**
     * Calculates the real distance between the start and stop points with the
     * scale set in the perspective calibration object.
     * @param  start Start point of the measurement.
     * @param  stop  Stop point of the measurement.
     * @return       Distance in millimeters.
     */
    double getRealDistance(cv::Point2f start, cv::Point2f stop);
};

#endif /* IMAGEDISTANCE_H */
