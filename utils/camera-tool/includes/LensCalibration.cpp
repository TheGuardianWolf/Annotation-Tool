/**
 * LensCalibration.cpp
 * Created by Jerry Fan, property of The University of Auckland.
 * Licenced under the Artistic Licence 2.0.
 */

#include "LensCalibration.hpp"

#include <iostream>

#include <opencv2/core/utility.hpp>
#include <opencv2/core/persistence.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/videoio.hpp>
#include <opencv2/calib3d.hpp>

using namespace cv;
using namespace std;

namespace
{
    /**
     * Checks if extension is .xml or .yaml.
     * @param  input Filename.
     * @return       If extension is valid.
     */
    bool isMarkup(string input)
    {
        return input.substr(input.length()-4, input.npos) == ".xml" || input.substr(input.length()-5, input.npos) == ".yaml";
    }
}

/**
 * Class initialisers set board inner popints to 15 by 8, square size to 18
 * arbitary units, pattern to chessboards, along with the default flags
 * suggested by OpenCV.
 */

LensCalibration::LensCalibration()
:boardSize(15, 8),
squareSize(18),
pattern("CHESSBOARD"),
flag(CALIB_FIX_PRINCIPAL_POINT |
    CALIB_ZERO_TANGENT_DIST |
    CALIB_FIX_ASPECT_RATIO |
    CALIB_FIX_K4 |
    CALIB_FIX_K5),
chessBoardFlags(CALIB_CB_ADAPTIVE_THRESH |
                CALIB_CB_NORMALIZE_IMAGE |
                CALIB_CB_FAST_CHECK),
calibrated(false),
mapped(false),
frameCount(0),
cameraMatrix(Mat::eye(3, 3, CV_64F)),
distCoeffs(Mat::zeros(8, 1, CV_64F))
{

}

LensCalibration::LensCalibration(string calibrationFile)
:boardSize(15, 8),
squareSize(18),
pattern("CHESSBOARD"),
flag(CALIB_FIX_PRINCIPAL_POINT |
    CALIB_ZERO_TANGENT_DIST |
    CALIB_FIX_ASPECT_RATIO |
    CALIB_FIX_K4 |
    CALIB_FIX_K5),
chessBoardFlags(CALIB_CB_ADAPTIVE_THRESH |
                CALIB_CB_NORMALIZE_IMAGE |
                CALIB_CB_FAST_CHECK),
calibrated(false),
mapped(false),
frameCount(0),
cameraMatrix(Mat::eye(3, 3, CV_64F)),
distCoeffs(Mat::zeros(8, 1, CV_64F))
{
    if (calibrationFile.size())
    {
        if (isMarkup(calibrationFile))
        {
            this->fromFile(calibrationFile);
        }
        else
        {
            this->fromVideo(calibrationFile, 50);
        }

        this->generateMaps();
    }
}

LensCalibration::LensCalibration(string calibrationFile, size_t calibFrames)
:boardSize(15, 8),
squareSize(18),
pattern("CHESSBOARD"),
flag(CALIB_FIX_PRINCIPAL_POINT |
    CALIB_ZERO_TANGENT_DIST |
    CALIB_FIX_ASPECT_RATIO |
    CALIB_FIX_K4 |
    CALIB_FIX_K5),
chessBoardFlags(CALIB_CB_ADAPTIVE_THRESH |
                CALIB_CB_NORMALIZE_IMAGE |
                CALIB_CB_FAST_CHECK),
calibrated(false),
mapped(false),
frameCount(0),
cameraMatrix(Mat::eye(3, 3, CV_64F)),
distCoeffs(Mat::zeros(8, 1, CV_64F))
{
    if (calibrationFile.size())
    {
        if (!isMarkup(calibrationFile))
        {
            this->fromVideo(calibrationFile, calibFrames);
        }
        else
        {
            this->fromFile(calibrationFile);
        }

        this->generateMaps();
    }
}

bool LensCalibration::runCalibration()
{
    vector<Mat> rvecs, tvecs;

    vector<vector<Point3f> > objectPoints(1);

    objectPoints[0].clear();

    for( int i = 0; i < boardSize.height; ++i )
    {
        for( int j = 0; j < boardSize.width; ++j )
        {
            objectPoints[0].push_back(Point3f(j*squareSize, i*squareSize, 0));
        }
    }

    objectPoints.resize(this->imagePoints.size(), objectPoints[0]);

    calibrateCamera(objectPoints, this->imagePoints, this->imageSize, this->cameraMatrix, this->distCoeffs, rvecs, tvecs, this->flag);

    return checkRange(this->cameraMatrix) && checkRange(this->distCoeffs);
}

bool LensCalibration::isCalibrated()
{
    return this->calibrated;
}

bool LensCalibration::isMapped()
{
    return this->mapped;
}

bool LensCalibration::fromVideo(string filePath, size_t calibFrames)
{
    VideoCapture inputCapture;
    inputCapture.open(filePath);

    if (calibFrames <= 0)
    {
        calibFrames = 50;
    }

    if (inputCapture.isOpened())
    {
        unsigned int frameCount = 0;

        this->imagePoints.clear();

        while(true)
        {
            Mat view;

            if( inputCapture.isOpened() )
            {
                inputCapture >> view;
            }

            // Break conditions
            // calibFrames need to be under 50 otherwise the program will hang
            if( imagePoints.size() >= calibFrames || view.empty() )
            {
                inputCapture.release();

                if(!this->imagePoints.empty())
                {
                    runCalibration();

                    this->frameCount = (int) this->imagePoints.size();
                    this->optimalCameraMatrix = getOptimalNewCameraMatrix(this->cameraMatrix, this->distCoeffs, this->imageSize, 1, this->imageSize, 0);

                    this->calibrated = true;
                    this->mapped = false;

                    return true;
                }
                else
                {
                    this->calibrated = false;
                    this->mapped = false;
                }

                return false;
            }

            cout << "\r" << "Frame " << frameCount << flush;
            frameCount++;

            imageSize = view.size();

            vector<Point2f> pointBuf;

            bool found = findChessboardCorners(view, this->boardSize, pointBuf, this->chessBoardFlags);

            if (found)
            {
                cout << " - found pattern" << endl;
                Mat viewGray;
                cvtColor(view, viewGray, COLOR_BGR2GRAY);
                cornerSubPix( viewGray, pointBuf, Size(11,11), Size(-1,-1), TermCriteria(TermCriteria::EPS+TermCriteria::COUNT, 30, 0.1));
                this->imagePoints.push_back(pointBuf);
            }
        }
    }

    return false;
}

bool LensCalibration::fromFile(string filePath)
{
    FileStorage fs(filePath, FileStorage::READ);

    if (fs.isOpened())
	{
        fs["nr_of_frames"] >> this->frameCount;

        Size calibrationSize;

        fs["image_width"] >> calibrationSize.width;
        fs["image_height"] >> calibrationSize.height;

        this->imageSize = calibrationSize;

        fs["camera_matrix"] >> this->cameraMatrix;
        fs["optimal_camera_matrix"] >> this->optimalCameraMatrix;
        fs["distortion_coefficients"] >> this->distCoeffs;

        fs.release();

        this->calibrated = true;
        this->mapped = false;

        return true;
    }

    return false;
}

bool LensCalibration::store(string filePath)
{
    if (this->calibrated)
    {
        FileStorage fs( filePath, FileStorage::WRITE );

        if (fs.isOpened())
        {
            fs << "nr_of_frames" << this->frameCount;
            fs << "image_width" << this->imageSize.width;
            fs << "image_height" << this->imageSize.height;
            fs << "camera_matrix" << this->cameraMatrix;
            fs << "optimal_camera_matrix" << this->optimalCameraMatrix;
            fs << "distortion_coefficients" << this->distCoeffs;

            fs.release();

            return true;
        }
    }

    return false;
}

bool LensCalibration::generateMaps()
{
    if(!this->mapped && this->calibrated)
    {
        initUndistortRectifyMap(
					this->cameraMatrix, this->distCoeffs, Mat(),
					this->cameraMatrix, this->imageSize,
					CV_16SC2, this->calibMap1, this->calibMap2);
        this->mapped = true;
        return true;
    }

    return false;
}

bool LensCalibration::onImage(string imagePath, Mat& fixedImage)
{
    if (this->mapped)
    {
        Mat rawImage;

        try
        {
            rawImage = imread(imagePath);
        }
        catch(int e)
        {
            cout << "Image could not be read: " << imagePath << endl;
            return false;
        }

        if (rawImage.size() == this->imageSize)
        {
            // Fix distortion
            remap(rawImage, fixedImage, this->calibMap1, this->calibMap2, INTER_LINEAR);
            return true;
        }
        else
        {
            cout << "Input image is not the same resolution as calibration sequence: " << imagePath << endl;
        }
    }
    return false;
}

Point2f LensCalibration::onPoint(const Point2f& point)
{
    Point2f buf(-1,-1);

    if (point.x >= 0 && point.y >= 0)
    {
        vector<Point2f> src(1, point);
        vector<Point2f> dst;

        undistortPoints(src, dst, this->cameraMatrix, this->distCoeffs, Mat(), this->cameraMatrix);

        buf = dst[0];
    }

    return buf;

}
