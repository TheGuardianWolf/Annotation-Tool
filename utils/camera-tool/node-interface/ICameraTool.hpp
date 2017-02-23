#ifndef CAMERATOOL_H
#define CAMERATOOL_H

#include <nan.h>
#include <memory>

#include "../includes/LensCalibration.hpp"
#include "../includes/PerspectiveCalibration.hpp"
#include "../includes/ImageDistance.hpp"

class ICameraTool : public Nan::ObjectWrap
{
public:
    static void Init(v8::Local<v8::Object> exports, v8::Local<v8::Object> module);

    // Need to be in public otherwise static methods can't access.
    // Can be improved via getters / setters but JS can't touch
    // these anyway.
    std::shared_ptr<LensCalibration> lCalib;
    std::shared_ptr<PerspectiveCalibration> pCalib;
    std::shared_ptr<ImageDistance> imgDst;

private:
    explicit ICameraTool();
    ~ICameraTool();

    static NAN_METHOD(New);
    
    // bool isReady()
    static NAN_METHOD(isReady);

    // bool extractVideo(String src, String dst)
    static NAN_METHOD(extractImages);

    // LensCalibration wrapper methods
    // bool loadLensCalibration(String filePath, Number calibrationFrames = 50)
    static NAN_METHOD(loadLensCalibration);
    // bool storeLensCalibration(String outputPath)
    static NAN_METHOD(storeLensCalibration);
    // [Overloaded]
    // bool runLensCalibration(String imagePath, String outputPath)
    // Object{"x" : Number, "y" : Number} runLensCalibration(Number x, Number y)
    // Object{"x" : Number, "y" : Number} runLensCalibration(Object{"x" : Number, "y" : Number} point)
    static NAN_METHOD(runLensCalibration);

    // PerspectiveCalibration wrapper methods
    // [Overloaded]
    // bool loadPerspectiveCalibration(Array original, Object {"x" : Number, "y" : Number} trueSize)
    // bool loadPerspectiveCalibration(Array original, Object {"x" : Number, "y" : Number} trueSize, Object {"x" : Number, "y" : Number} translate)
    static NAN_METHOD(loadPerspectiveCalibration);
    // bool storePerspectiveCalibration(String outputPath)
    static NAN_METHOD(storePerspectiveCalibration);
    // [Overloaded]
    // bool runPerspectiveCalibration(String imagePath, String outputPath)
    // Object{"x" : Number, "y" : Number} runPerspectiveCalibration(Number x, Number y)
    // Object{"x" : Number, "y" : Number} runPerspectiveCalibration(Object{"x" : Number, "y" : Number} point)
    static NAN_METHOD(runPerspectiveCalibration);

    // ImageDistance wrapper methods
    // bool loadImageDistance(Object{"x" : Number, "y" : Number} origin)
    static NAN_METHOD(loadImageDistance);
    // bool setImageOrigin(Object{"x" : Number, "y" : Number} origin)
    static NAN_METHOD(setImageOrigin);
    // bool getRealCoordinate(Object{"x" : Number, "y" : Number} coordinate)
    static NAN_METHOD(getRealCoordinate);
    // Object{"x" : Number, "y" : Number} getRealDistance(Object{"x" : Number, "y" : Number} from, Object{"x" : Number, "y" : Number} to)
    static NAN_METHOD(getRealDistance);

    static Nan::Persistent<v8::Function> constructor;
};
#endif /* CAMERATOOL_H */