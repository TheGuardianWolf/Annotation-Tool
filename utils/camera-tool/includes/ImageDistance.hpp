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
    ImageDistance(std::shared_ptr<LensCalibration> l, std::shared_ptr<PerspectiveCalibration> p, cv::Point2f o);
    ~ImageDistance();
    bool isReady();
    bool setOrigin(cv::Point2f origin);
    cv::Point2f getOrigin();
    cv::Point2f getRealCoordinate(cv::Point2f position);
    double getRealDistance(cv::Point2f start, cv::Point2f stop);
};

#endif /* IMAGEDISTANCE_H */