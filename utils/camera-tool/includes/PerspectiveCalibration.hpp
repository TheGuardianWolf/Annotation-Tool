#ifndef PERSPECTIVECALIBRATION_H
#define PERSPECTIVECALIBRATION_H

#include <opencv2/core.hpp>

class PerspectiveCalibration
{
private:
    std::vector<cv::Point2f> ptsSrc; // 0. Top Left, 1. Top Right, 2. Bottom Left, 3. Bottom Right
    std::vector<cv::Point2f> ptsDst; // 0. Top Left, 1. Top Right, 2. Bottom Left, 3. Bottom Right
    cv::Mat transform;
    cv::Point2i translation;
    bool performTransform();
    bool calibrated;
    double scaleFactor;

public:
    
    PerspectiveCalibration();
    PerspectiveCalibration(std::string);
    PerspectiveCalibration(std::vector<cv::Point2f>& original, std::vector<cv::Point2f>& transformed, double scaleFactor);
    PerspectiveCalibration(std::vector<cv::Point2f>& original, cv::Point2f trueSize);
    PerspectiveCalibration(std::vector<cv::Point2f>& original, cv::Point2f trueSize, cv::Point2f translation);
    bool isCalibrated();
    double getScaleFactor();
    bool setScaleFactor(double sf);
    std::vector<cv::Point2f> estimateTransformed(std::vector<cv::Point2f>& original, cv::Point2f trueSize, cv::Point2f translation);
    bool fromPoints(std::vector<cv::Point2f>& original, std::vector<cv::Point2f>& transformed, double scaleFactor);
    bool fromPoints(std::vector<cv::Point2f>& original, cv::Point2f trueSize);
    bool fromPoints(std::vector<cv::Point2f>& original, cv::Point2f trueSize, cv::Point2f translation);
    bool fromFile(std::string filePath);
    bool store(std::string filePath);
    bool onImage(std::string imagePath, cv::Mat& fixedImage);
    cv::Point2f onPoint(const cv::Point2f& point);
};

#endif /* PERSPECTIVECALIBRATION_H */