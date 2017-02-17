/**
 * CameraTool.cpp
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 *
 * This tool interfaces with the calibration and distance C++ modules for a
 * range of purposes, including providing an interface for inferring a
 * coordinate for the Annotation-Tool using JSON to pass data.
 */

#include "./includes/LensCalibration.hpp"
#include "./includes/PerspectiveCalibration.hpp"
#include "./includes/ImageDistance.hpp"

#include <opencv2/core.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/videoio.hpp>

#include <sstream>
#include <string>
#include <iostream>
#include <memory>

using namespace std;
using namespace cv;

/**
 * Function to extract frames from a video.
 * JSON output gives the video FPS.
 * @param src Source video file.
 * @param dst Destination directory.
 */
void extractImages(string src, string dst)
{
    VideoCapture video(src);
    if (video.isOpened())
    {
        Mat frame;
        int frameCount = 0;

		auto fps = video.get(CAP_PROP_FPS);

        if
        (
            dst.substr(dst.length() - 1, 1) != "/" ||
            dst.substr(dst.length() - 1, 1) != "\\"
        )
        {
            dst += "/";
        }

        while(true)
        {
            video >> frame;
            if (!frame.empty())
            {
                frameCount++;

                string filename = to_string(frameCount);
                imwrite(dst + filename + ".jpg", frame);
            }
            else
            {
                break;
            }
        }

        cout << "{\"fps\":" << fps << "}";
    }
}

/**
 * Performs lens calibration using OpenCV on a calibration video and saves a
 * calibration file.
 * @param src    Source video.
 * @param dst    Destination markup file (.xml or .yaml extension required).
 * @param frames Number of valid calibration frames (Don't use over 50).
 */
void lensCalibrationV(string src, string dst, string frames)
{
    LensCalibration lCalib;
    if (lCalib.fromVideo(src, (size_t) stoi(frames)))
    {
        lCalib.store(dst);
    }
}

/**
 * Removes lens distortion on an image based on a calibration file.
 * @param src       Source image.
 * @param dst       Destination image (valid extension required).
 * @param calibFile Calibration file.
 */
void lensCalibrationI(string src, string dst, string calibFile)
{
    LensCalibration lCalib;
    if (lCalib.fromFile(calibFile))
    {
        Mat M;
        if (lCalib.generateMaps())
        {
            if(lCalib.onImage(src, M))
            {
                imwrite(dst, M);
            }
        }
    }
}

/**
 * Removes lens distortion on a point based on a calibration file.
 * @param x         Image space x.
 * @param y         Image space y.
 * @param calibFile Calibration file.
 */
void lensCalibrationP(string x, string y, string calibFile)
{
    LensCalibration lCalib;
    if (lCalib.fromFile(calibFile))
    {
        if (lCalib.generateMaps())
        {
            Point2f transformed = lCalib.onPoint(Point2f(stof(x), stof(y)));
            cout << "{\"x\":" << transformed.x << ",\"y\":" << transformed.y << "}";
        }
    }
}

/**
 * Creates perspective calibration files from source points in image space and
 * the real world size of the planar rectangle specified from the source points.
 * @param tLPtsSrcX  Source quadrilateral top left x.
 * @param tLPtsSrcY  Source quadrilateral top left y.
 * @param tRPtsSrcX  Source quadrilateral top right x.
 * @param tRPtsSrcY  Source quadrilateral top right y.
 * @param bLPtsSrcX  Source quadrilateral bottom left x.
 * @param bLPtsSrcY  Source quadrilateral bottom left y.
 * @param bRPtsSrcX  Source quadrilateral bottom right x.
 * @param bRPtsSrcY  Source quadrilateral bottom right y.
 * @param ratioX     Real length of the planar rectangle.
 * @param ratioY     Real width of the planar rectangle.
 * @param lCalibFile Lens calibration file.
 * @param outFile    Output calibration file (.xml or .yaml extension).
 */
void perspectiveCalibrationF
(
    string tLPtsSrcX, string tLPtsSrcY,
    string tRPtsSrcX, string tRPtsSrcY,
    string bLPtsSrcX, string bLPtsSrcY,
    string bRPtsSrcX, string bRPtsSrcY,
    string ratioX, string ratioY,
    string lCalibFile,
    string outFile
)
{
    LensCalibration lCalib(lCalibFile);
    vector<Point2f> ptsSrc;
    ptsSrc.push_back(lCalib.onPoint(Point2f(stof(tLPtsSrcX), stof(tLPtsSrcY))));
    ptsSrc.push_back(lCalib.onPoint(Point2f(stof(tRPtsSrcX), stof(tRPtsSrcY))));
    ptsSrc.push_back(lCalib.onPoint(Point2f(stof(bLPtsSrcX), stof(bLPtsSrcY))));
    ptsSrc.push_back(lCalib.onPoint(Point2f(stof(bRPtsSrcX), stof(bRPtsSrcY))));

    Point2f ratio(stof(ratioX), stof(ratioY));

    PerspectiveCalibration pCalib;


    vector<Point2f> ptsDst = pCalib.estimateTransformed(ptsSrc, ratio, Point2f(0,0));

    Mat M;
    pCalib.fromPoints(ptsSrc, ratio);
    pCalib.store(outFile);
}

/**
 * Performs perspective distortion correction on an image based on a calibraiton
 * file.
 * @param src       Source image file.
 * @param dst       Destination image file (with valid extension).
 * @param calibFile Calibration file.
 */
void perspectiveCalibrationI(string src, string dst, string calibFile)
{
    PerspectiveCalibration pCalib;

    Mat M;
    pCalib.fromFile(calibFile);
    pCalib.onImage(src, M);

    imwrite(dst, M);
}

/**
 * Performs perspective distortion correction on a point based on a calibration
 * file.
 * @param x         Image x.
 * @param y         Image y.
 * @param calibFile Calibration file.
 */
void perspectiveCalibrationP(string x, string y, string calibFile)
{
    PerspectiveCalibration pCalib;

    if (pCalib.fromFile(calibFile))
    {
        Point2f transformed = pCalib.onPoint(Point2f(stof(x), stof(y)));
        cout << "{\"x\":" << transformed.x << ",\"y\":" << transformed.y << "}";
    }
}

/**
 * Finds the coordinate of the specified point based on a virtual coordinate
 * system constructed using the calibration files, with the user defined origin
 * as the origin (0, 0).
 * @param x          Image x.
 * @param y          Image y.
 * @param originX    Image origin x.
 * @param originY    Image origin y.
 * @param lCalibFile Lens calibration file.
 * @param pCalibFile Perspective calibration file.
 */
void imageDistanceP(string x, string y, string originX, string originY, string lCalibFile, string pCalibFile)
{
    shared_ptr<LensCalibration> l = make_shared<LensCalibration>(lCalibFile);
    shared_ptr<PerspectiveCalibration> p = make_shared<PerspectiveCalibration>(pCalibFile);
    ImageDistance imgDst(l, p, Point2f(stof(originX), stof(originY)));

    Point2f transformed = imgDst.getRealCoordinate(Point2f(stof(x), stof(y)));

    cout << "{\"x\":" << transformed.x << ",\"y\":" << transformed.y << "}";
}

/**
 * Finds the distance between two points in real world distance based on a
 * virtual coordinate system constructed using the calibration files.
 * @param startX     Image first point x.
 * @param startY     Image first point y.
 * @param endX       Image second point x.
 * @param endY       Image second point y.
 * @param lCalibFile Lens calibration file.
 * @param pCalibFile Perspective calibration file.
 */
void imageDistanceD(
    string startX, string startY,
    string endX, string endY,
    string lCalibFile, string pCalibFile
)
{
    shared_ptr<LensCalibration> l = make_shared<LensCalibration>(lCalibFile);
    shared_ptr<PerspectiveCalibration> p = make_shared<PerspectiveCalibration>(pCalibFile);

    ImageDistance imgDst(l, p);

    double distance = imgDst.getRealDistance(Point2f(stof(startX), stof(startY)), Point2f(stof(endX), stof(endY)));

    cout << "{\"distance\":" << distance << "}";
}

int main(int argc, char** argv)
{
    string option = argv[1];
    if (option == "-E")
    {
        extractImages(argv[2], argv[3]);
    }
    else if (option == "-Lv")
    {
        lensCalibrationV(argv[2], argv[3], argv[4]);
    }
    else if (option == "-Li")
    {
        lensCalibrationI(argv[2], argv[3], argv[4]);
    }
    else if (option == "-Lp")
    {
        lensCalibrationP(argv[2], argv[3], argv[4]);
    }
    else if (option == "-Pf")
    {
        perspectiveCalibrationF
        (
            argv[2], argv[3],
            argv[4], argv[5],
            argv[6], argv[7],
            argv[8], argv[9],
            argv[10], argv[11],
            argv[12],
            argv[13]
        );
    }
    else if (option == "-Pi")
    {
        perspectiveCalibrationI(argv[2], argv[3], argv[4]);
    }
    else if (option == "-Pp")
    {
        perspectiveCalibrationP(argv[2], argv[3], argv[4]);
    }
    else if (option == "-Ip")
    {
        imageDistanceP
        (
            argv[2], argv[3],
            argv[4], argv[5],
            argv[6], argv[7]
        );
    }
    else if (option == "-Id")
    {
        imageDistanceD
        (
            argv[2], argv[3],
            argv[4], argv[5],
            argv[5], argv[6]
        );
    }
}
