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

void lensCalibrationV(string src, string dst, string frames)
{
    LensCalibration lCalib;
    if (lCalib.fromVideo(src, (size_t) stoi(frames)))
    {
        lCalib.store(dst);
    }
}

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

void perspectiveCalibrationI(string src, string dst, string calibFile)
{
    PerspectiveCalibration pCalib;

    Mat M;
    pCalib.fromFile(calibFile);
    pCalib.onImage(src, M);

    imwrite(dst, M);
}

void perspectiveCalibrationP(string x, string y, string calibFile)
{
    PerspectiveCalibration pCalib;

    if (pCalib.fromFile(calibFile))
    {
        Point2f transformed = pCalib.onPoint(Point2f(stof(x), stof(y)));
        cout << "{\"x\":" << transformed.x << ",\"y\":" << transformed.y << "}";
    }
}

void imageDistanceP(string x, string y, string originX, string originY, string lCalibFile, string pCalibFile)
{
    shared_ptr<LensCalibration> l = make_shared<LensCalibration>(lCalibFile);
    shared_ptr<PerspectiveCalibration> p = make_shared<PerspectiveCalibration>(pCalibFile);
    ImageDistance imgDst(l, p, Point2f(stof(originX), stof(originY)));

    Point2f transformed = imgDst.getRealCoordinate(Point2f(stof(x), stof(y)));

    cout << "{\"x\":" << transformed.x << ",\"y\":" << transformed.y << "}";
}

void imageDistanceD
(
    string startX, string startY,
    string endX, string endY,
    string originX, string originY,
    string lCalibFile, string pCalibFile
)
{
    shared_ptr<LensCalibration> l = make_shared<LensCalibration>(lCalibFile);
    shared_ptr<PerspectiveCalibration> p = make_shared<PerspectiveCalibration>(pCalibFile);

    ImageDistance imgDst(l, p, Point2f(stof(originX), stof(originY)));

    double distance = imgDst.getRealDistance(Point2f(stof(startX), stof(startY)), Point2f(stof(endX), stof(endY)));

    cout << "{\"distance\":" << distance << "}";
}

int main( int argc, char** argv)
{
    string switches = argv[1];
    if (switches == "-E")
    {
        extractImages(argv[2], argv[3]);
    }
    else if (switches == "-Lv")
    {
        lensCalibrationV(argv[2], argv[3], argv[4]);
    }
    else if (switches == "-Li")
    {
        lensCalibrationI(argv[2], argv[3], argv[4]);
    }
    else if (switches == "-Lp")
    {
        lensCalibrationP(argv[2], argv[3], argv[4]);
    }
    else if (switches == "-Pf")
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
    else if (switches == "-Pi")
    {
        perspectiveCalibrationI(argv[2], argv[3], argv[4]);
    }
    else if (switches == "-Pp")
    {
        perspectiveCalibrationP(argv[2], argv[3], argv[4]);
    }
    else if (switches == "-Ip")
    {
        imageDistanceP
        (
            argv[2], argv[3],
            argv[4], argv[5],
            argv[6], argv[7]
        );
    }
    else if (switches == "-Id")
    {
        imageDistanceD
        (
            argv[2], argv[3],
            argv[4], argv[5],
            argv[5], argv[6],
            argv[7], argv[8]
        );
    }
}

// //==== storing data ====
// FileStorage fs(".xml", FileStorage::WRITE + FileStorage::MEMORY);
// fs << "date" << date_string << "mymatrix" << mymatrix;
// string buf = fs.releaseAndGetString();

// //==== reading it back ====
// FileStorage fs(buf, FileStorage::READ + FileStorage::MEMORY);
// fs["date"] >> date_string;
// fs["mymatrix"] >> mymatrix;
