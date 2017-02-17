/**
 * PerspectiveCalibration.hpp
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 *
 * This module uses the OpenCV perspective transform functions to recover a
 * homography that will transform the image space to a top-down virtual image
 * space, and also figure out a scale factor relative to real world space.
 */

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

    /**
     * Check if calibration is avaliable.
     * @return Whether the current object is calibrated.
     */
    bool isCalibrated();

    /**
     * Get the currently set scale factor.
     * @return The scale factor.
     */
    double getScaleFactor();

    /**
     * Set a scale factor.
     * @param  sf The scale factor.
     * @return    Boolean indicator of success.
     */
    bool setScaleFactor(double sf);

    /**
     * Estimate a new rectangle based on a supplied quadrilateral with the same
     * ratio as the true rectangle size in real world size.
     * @param  original The vector of image space quadrilateral coodinates.
     *                  [0] Top Left.
     *                  [1] Top Right.
     *                  [2] Bottom Left.
     *                  [3] Bottom Right.
     * @param  trueSize    Real size of the planar rectangle (in millimetres).
     * @param  translation Translate the resulting rectangle by amount.
     * @return             Vector of points containing coordinates to the estimated
     *                     rectangle.
     *                     [0] Top Left.
     *                     [1] Top Right.
     *                     [2] Bottom Left.
     *                     [3] Bottom Right.
     */
    std::vector<cv::Point2f> estimateTransformed(std::vector<cv::Point2f>& original, cv::Point2f trueSize, cv::Point2f translation);

    /**
     * Perform perspective calibration based on input quadrilateral points in
     * the image space of a real world planar rectangle, and input rectangle
     * points to map to.
     * @param  original The vector of image space quadrilateral coodinates.
     *                  [0] Top Left.
     *                  [1] Top Right.
     *                  [2] Bottom Left.
     *                  [3] Bottom Right.
     * @param  transformed The vector of an image space rectangle to determine
     *                     a homography.
     * @param  scaleFactor The real world distance per pixel.
     * @return             Boolean indicator of success.
     */
    bool fromPoints(std::vector<cv::Point2f>& original, std::vector<cv::Point2f>& transformed, double scaleFactor);

    /**
     * Perform perspective calibration based on input quadrilateral points in
     * the image space of a real world planar rectangle, and estimate the points
     * to map to.
     * @param  original The vector of image space quadrilateral coodinates.
     *                  [0] Top Left.
     *                  [1] Top Right.
     *                  [2] Bottom Left.
     *                  [3] Bottom Right.
     * @param  trueSize Real size of the planar rectangle (in millimeteres).
     * @return          Boolean indicator of success.
     */
    bool fromPoints(std::vector<cv::Point2f>& original, cv::Point2f trueSize);

    /**
     * Perform perspective calibration based on input quadrilateral points in
     * the image space of a real world planar rectangle, and estimate the points
     * to map to.
     * @param  original    The vector of image space quadrilateral coodinates.
     *                     [0] Top Left.
     *                     [1] Top Right.
     *                     [2] Bottom Left.
     *                     [3] Bottom Right.
     * @param  trueSize    Real size of the planar rectangle (in millimeteres).
     * @param  translation Translate estimated box by pixels.
     * @return             Boolean indicator of success.
     */
    bool fromPoints(std::vector<cv::Point2f>& original, cv::Point2f trueSize, cv::Point2f translation);

    /**
     * Load perspective calibration from a saved calibration file.
     * @param  filePath Calibration file.
     * @return          Boolean indicator of success.
     */
    bool fromFile(std::string filePath);

    /**
     * Stores the calibration in the current object to a file.
     * @param  filePath Calibration file.
     * @return          Boolean indicator of success.
     */
    bool store(std::string filePath);

    /**
     * Perform perspective calibration on an image.
     * @param  imagePath  Image file.
     * @param  fixedImage Transformed image file.
     * @return            Boolean indicator of success.
     */
    bool onImage(std::string imagePath, cv::Mat& fixedImage);

    /**
     * Perform perspective calibration on a point.
     * @param  point Original image space point.
     * @return       Transformed point.
     */
    cv::Point2f onPoint(const cv::Point2f& point);
};

#endif /* PERSPECTIVECALIBRATION_H */
