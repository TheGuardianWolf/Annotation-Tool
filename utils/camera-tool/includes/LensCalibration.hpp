#ifndef LENSCALIBRATION_H
#define LENSCALIBRATION_H

#include <opencv2/core.hpp>

class LensCalibration
{
private:
    const cv::Size boardSize;
    const unsigned int squareSize;  // Millimeters
    const std::string pattern;
    const int flag;
    const int chessBoardFlags;

    bool calibrated;
    bool mapped;
    int frameCount;
    cv::Size imageSize;
    cv::Mat cameraMatrix;
    cv::Mat optimalCameraMatrix;
    cv::Mat distCoeffs;

    cv::Mat calibMap1;
    cv::Mat calibMap2;

    std::vector< std::vector<cv::Point2f> > imagePoints;

    bool runCalibration();
    
public:
    LensCalibration();
    LensCalibration(std::string calibrationFile);
    LensCalibration(std::string calibrationFile, size_t calibFrames);
    bool isCalibrated();
    bool isMapped();
    bool fromVideo(std::string filePath, size_t calibFrames);
    bool fromFile(std::string filePath);
    bool store(std::string filePath);
    bool generateMaps();
    bool onImage(std::string imagePath, cv::Mat& fixedImage);
    cv::Point2f onPoint(const cv::Point2f& point);
};

#endif /* LENSCALIBRATION_H */