/**
 * LensCalibration.hpp
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 *
 * This module is based off the example code provided by OpenCV to calibrate 
 * and remove lens distortion based on a checkboard pattern.
 */

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

    /**
     * Check if calibration has been loaded.
     * @return Boolean.
     */
    bool isCalibrated();

    /**
     * Check if the calibration maps have been generated.
     * @return Boolean.
     */
    bool isMapped();

    /**
     * Perform calibration from a video sequence containing possible
     * checkerboard patterns in different positions.
     * @param  filePath    Video file.
     * @param  calibFrames Valid frames to take.
     * @return             Boolean indication of success.
     */
    bool fromVideo(std::string filePath, size_t calibFrames);

    /**
     * Load calibration from existing calibration file into the object.
     * @param  filePath Calibration file.
     * @return          Boolean indication of success.
     */
    bool fromFile(std::string filePath);

    /**
     * Stores the currently existing calibration to a file.
     * @param  filePath Output calibration file (with valid extension).
     * @return          Boolean indication of success.
     */
    bool store(std::string filePath);

    /**
     * Create the calibration maps from current camera matrix and distortion
     * coefficients
     * @return Boolean indication of success.
     */
    bool generateMaps();
    bool onImage(std::string imagePath, cv::Mat& fixedImage);
    cv::Point2f onPoint(const cv::Point2f& point);
};

#endif /* LENSCALIBRATION_H */
