/***

JS Bindings for the CameraTool classes.

Issues:

Method argument checks need to be done before pointer checks. This means error 
checking of arguments must occur before method body (see last three methods).

Non async methods will cause node process hang-ups when running.

***/

#include "ICameraTool.hpp"

#include <memory>
#include <iostream>
#include <opencv2/core.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/videoio.hpp>

using namespace cv;
using namespace std;

namespace
{
  string localValueToString(const v8::Local<v8::Value>& val)
  {
    return string(*Nan::Utf8String(val));
  }

  void returnPoint2f(const Nan::FunctionCallbackInfo<v8::Value>& info, Point2f& transformedPoint)
  {
    if (!(transformedPoint.x < 0 || transformedPoint.y < 0))
    {
      v8::Local<v8::Object> transObj = Nan::New<v8::Object>();

      v8::Local<v8::String> x = Nan::New<v8::String>("x").ToLocalChecked();
      v8::Local<v8::Number> transformedX = Nan::New<v8::Number>(transformedPoint.x);
      Nan::Set(transObj, x, transformedX);

      v8::Local<v8::String> y = Nan::New<v8::String>("y").ToLocalChecked();
      v8::Local<v8::Number> transformedY = Nan::New<v8::Number>(transformedPoint.y);
      Nan::Set(transObj, y, transformedY);

      info.GetReturnValue().Set(transObj);
    }
    else
    {
      info.GetReturnValue().Set(Nan::New<v8::Boolean>(false));
    }
  }

  bool isLocalPointObject(v8::Local<v8::Object>& pointObj)
  {
    return Nan::Has(pointObj,  Nan::New<v8::String>("x").ToLocalChecked()).FromMaybe(false) && Nan::Has(pointObj,  Nan::New<v8::String>("y").ToLocalChecked()).FromMaybe(false);
  }

  Point2f localObjectToPoint2f(v8::Local<v8::Object>& pointObj)
  {
    return Point2f
    (
      Nan::To<double>(Nan::Get(pointObj, Nan::New<v8::String>("x").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
      Nan::To<double>(Nan::Get(pointObj, Nan::New<v8::String>("y").ToLocalChecked()).ToLocalChecked()).FromMaybe(0)
    );
  }
}

ICameraTool::ICameraTool()
{

}

ICameraTool::~ICameraTool()
{

}

void ICameraTool::Init(v8::Local<v8::Object> exports, v8::Local<v8::Object> module)
{
  Nan::HandleScope scope;

  // Prepare constructor template
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New<v8::String>("ICameraTool").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(12);

  // Prototype
  Nan::SetPrototypeMethod(tpl, "isReady", isReady);

  Nan::SetPrototypeMethod(tpl, "extractImages", extractImages);

  Nan::SetPrototypeMethod(tpl, "loadLensCalibration", loadLensCalibration);
  Nan::SetPrototypeMethod(tpl, "storeLensCalibration", storeLensCalibration);
  Nan::SetPrototypeMethod(tpl, "runLensCalibration", runLensCalibration);

  Nan::SetPrototypeMethod(tpl, "loadPerspectiveCalibration", loadPerspectiveCalibration);
  Nan::SetPrototypeMethod(tpl, "storePerspectiveCalibration", storePerspectiveCalibration);
  Nan::SetPrototypeMethod(tpl, "runPerspectiveCalibration", runPerspectiveCalibration);

  Nan::SetPrototypeMethod(tpl, "loadImageDistance", loadImageDistance);
  Nan::SetPrototypeMethod(tpl, "setImageOrigin", setImageOrigin);
  Nan::SetPrototypeMethod(tpl, "getRealCoordinates", getRealCoordinate);
  Nan::SetPrototypeMethod(tpl, "getRealDistance", getRealDistance);

  constructor.Reset(Nan::GetFunction(tpl).ToLocalChecked());

  Nan::Set(module, Nan::New<v8::String>("exports").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
  // Nan::Set(exports, Nan::New<v8::String>("ICameraTool").ToLocalChecked(),
  //     Nan::GetFunction(tpl).ToLocalChecked());
}

// ICameraTool New()
NAN_METHOD(ICameraTool::New) 
{
  if (info.IsConstructCall()) 
  {
    // Invoked as constructor: `new ICameraTool(...)`
    ICameraTool* obj = new ICameraTool();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } 
  else 
  {
    // Invoked as plain function `ICameraTool(...)
    Nan::ThrowError("Use `new` to create instances of this object");
  }
}

// bool isReady()
NAN_METHOD(ICameraTool::isReady) 
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());
  info.GetReturnValue().Set(Nan::New<v8::Boolean>(obj->imgDst && obj->imgDst->isReady()));
}

// bool extractVideo(String src, String dst)
NAN_METHOD(ICameraTool::extractImages)
{  
  string src;
  string dst;

  // Check argument types
  int overloadSignature = -1;

  if (info.Length() == 2 && info[0]->IsString() && info[1]->IsString())
  {
    overloadSignature = 0;
  }
  else
  {
    Nan::ThrowTypeError("This method accepts two String types.");
    return;
  }

  bool status = false;
  
  switch (overloadSignature)
  {
  case 0:
    {
      src = localValueToString(info[0]);
      dst = localValueToString(info[1]);
      VideoCapture video(src);
      if (video.isOpened())
      {
          Mat frame;
          unsigned int frameCount = 0;

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
                cout << "\r" << "Exporting frame " << frameCount << flush;

                string filename = to_string(frameCount);
                imwrite(dst + filename + ".jpg", frame);
              }
              else
              {
                break;
              }
              
          } 

          cout << endl;

          status = true;
      }
      else
      {
        Nan::ThrowError("Video file cannot be opened.");
      }
    }
    break;
  default:
    Nan::ThrowRangeError("Overload signature is not valid.");
    return;
  }

  info.GetReturnValue().Set(Nan::New<v8::Boolean>(status));

  return;
}

// bool loadLensCalibration(String filePath, Number calibrationFrames = 50)
NAN_METHOD(ICameraTool::loadLensCalibration) 
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());
  if (info.Length() <= 2 && info[0]->IsString())
  {
    string filePath = localValueToString(info[0]);
    int calibFrames = 50;

    if (info[1]->IsNumber())
    {
      calibFrames = Nan::To<int32_t>(info[1]).FromMaybe(50);
    }

    if (calibFrames <= 0)
    {
      obj->lCalib = make_shared<LensCalibration>(filePath, 50);
    }
    else
    {
      obj->lCalib = make_shared<LensCalibration>(filePath, calibFrames);
    }
    
    obj->lCalib->generateMaps();

    bool status = obj->lCalib ? obj->lCalib->isCalibrated() && obj->lCalib->isMapped() : false;

    info.GetReturnValue().Set(Nan::New<v8::Boolean>(status));
  }
  else
  {
    Nan::ThrowTypeError("This method accepts a string and number type.");
  }
}

// bool storeLensCalibration(String outputPath)
NAN_METHOD(ICameraTool::storeLensCalibration) 
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());

  if (obj->lCalib)
  {
    if (info.Length() == 1 && info[0]->IsString())
    {
      string filePath = localValueToString(info[0]);

      bool status = obj->lCalib->store(filePath);

      info.GetReturnValue().Set(Nan::New<v8::Boolean>(status));
    }
    else
    {
      Nan::ThrowTypeError("This method accepts a string type.");
    }
  }
  else
  {
    Nan::ThrowError("LensCalibration object not loaded.");
  }

}

// [Overloaded]
// bool runLensCalibration(String imagePath, String outputPath)
// Object{"x" : Number, "y" : Number} runLensCalibration(Number x, Number y)
// Object{"x" : Number, "y" : Number} runLensCalibration(Object{"x" : Number, "y" : Number} point)
NAN_METHOD(ICameraTool::runLensCalibration) 
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());
  bool status = false;

  if (obj->lCalib)
  {
    if(info[0]->IsString() && info[1]->IsString())
    {
      Mat fixedImage;
      
      status = obj->lCalib->onImage(localValueToString(info[0]), fixedImage) && 
      imwrite(localValueToString(info[1]), fixedImage);

      info.GetReturnValue().Set(Nan::New<v8::Boolean>(status));
    }
    else
    {
      Point2f originalPoint;

      if (info.Length() == 2 && info[0]->IsNumber() && info[1]->IsNumber())
      {
        originalPoint.x = Nan::To<double>(info[0]).FromMaybe(0);
        originalPoint.y = Nan::To<double>(info[1]).FromMaybe(0);
        
        Point2f transformedPoint = obj->lCalib->onPoint(originalPoint);

        returnPoint2f(info, transformedPoint);
      }
      else if (info.Length() == 1 && info[0]->IsObject())
      {
        v8::Local<v8::Object> pointObj = Nan::To<v8::Object>(info[0]).ToLocalChecked();

        if (isLocalPointObject(pointObj))
        {
          originalPoint = localObjectToPoint2f(pointObj);

          Point2f transformedPoint = obj->lCalib->onPoint(originalPoint);

          returnPoint2f(info, transformedPoint);
        }
        else 
        {
          Nan::ThrowError("Point object does not contain an 'x' and 'y' property.");
        }
      }
      else
      {
        Nan::ThrowTypeError("This method accepts two string, two number or an object type.");
      }
    }
  }
  else
  {
    Nan::ThrowError("LensCalibration object not loaded.");
  }
}

// // [Overloaded]
// // bool loadPerspectiveCalibration(Array original, Object {"x" : Number, "y" : Number} trueSize)
// // bool loadPerspectiveCalibration(Array original, Object {"x" : Number, "y" : Number} trueSize, Object {"x" : Number, "y" : Number} translate)
NAN_METHOD(ICameraTool::loadPerspectiveCalibration)
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());

  if (info.Length() >= 2 && info.Length() < 4 && info[0]->IsArray(), info[1]->IsObject())
  {
    v8::Local<v8::Array> original = v8::Local<v8::Array>::Cast(info[0]);
    v8::Local<v8::Object> trueSize = Nan::To<v8::Object>(info[1]).ToLocalChecked();

    vector<Point2f> originalPoints;

    if (original->Length() == 4)
    {
      for (unsigned int i = 0; i < original->Length(); i++)
      {
        v8::Local<v8::Object> arrayObj = Nan::To<v8::Object>(Nan::Get(original, i).ToLocalChecked()).ToLocalChecked();
        if (!arrayObj.IsEmpty() && isLocalPointObject(arrayObj))
        {
          originalPoints.push_back(localObjectToPoint2f(arrayObj));    
        }
      }

      if (originalPoints.size() == 4)
      {
        if (isLocalPointObject(trueSize))
        {
          if (info.Length() == 3 && info[2]->IsObject())
          {
            v8::Local<v8::Object> translate = Nan::To<v8::Object>(info[2]).ToLocalChecked();

            if (isLocalPointObject(translate))
            {
              obj->pCalib = make_shared<PerspectiveCalibration>
              (
                originalPoints, 
                localObjectToPoint2f(trueSize),
                localObjectToPoint2f(translate)
              );
            }
            else
            {
              Nan::ThrowTypeError("Object is not a point object.");
            }
          }
          else
          {
              obj->pCalib = make_shared<PerspectiveCalibration>
              (
                originalPoints, 
                localObjectToPoint2f(trueSize)
              );
          }

          bool status = obj->pCalib ? obj->pCalib->isCalibrated() : false;

          info.GetReturnValue().Set(Nan::New<v8::Boolean>(status));
        }
      }
      else
      {
        Nan::ThrowTypeError("Points array contains a non-point object.");
      }
    }
    else
    {
      Nan::ThrowError("Points array does not have a length of four.");
    }
  }
  else if (info.Length() == 1 && info[0]->IsString())
  {
    string filePath = localValueToString(info[0]);
    obj->pCalib = make_shared<PerspectiveCalibration>(filePath);
    bool status = obj->pCalib ? obj->pCalib->isCalibrated() : false;

    info.GetReturnValue().Set(Nan::New<v8::Boolean>(status));
  }
  else
  {
    Nan::ThrowTypeError("This method accepts an array of point objects, a point object, and a point object type.");
  }
}

// bool storePerspectiveCalibration(String outputPath)
NAN_METHOD(ICameraTool::storePerspectiveCalibration)
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());

  if (obj->pCalib)
  {
    if (info.Length() == 1 && info[0]->IsString())
    {
      string filePath = localValueToString(info[0]);

      bool status = obj->pCalib->store(filePath);

      info.GetReturnValue().Set(Nan::New<v8::Boolean>(status));
    }
    else
    {
      Nan::ThrowTypeError("This method accepts a string type.");
    }
  }
  else
  {
    Nan::ThrowError("PerspectiveCalibration object not loaded.");
  }
}

// [Overloaded]
// bool runPerspectiveCalibration(String imagePath, String outputPath)
// Object{"x" : Number, "y" : Number} runPerspectiveCalibration(Number x, Number y)
// Object{"x" : Number, "y" : Number} runPerspectiveCalibration(Object{"x" : Number, "y" : Number} point)
NAN_METHOD(ICameraTool::runPerspectiveCalibration) 
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());

  if (obj->pCalib)
  {
    bool status = false;

    if(info.Length() == 2 && info[0]->IsString() && info[1]->IsString())
    {
      Mat fixedImage;

      status = obj->pCalib->onImage(localValueToString(Nan::To<v8::String>(info[0]).ToLocalChecked()), fixedImage) && 
      imwrite(localValueToString(Nan::To<v8::String>(info[1]).ToLocalChecked()), fixedImage);

      info.GetReturnValue().Set(Nan::New<v8::Boolean>(status));
    }
    else
    {
      Point2f originalPoint;

      if (info.Length() == 2 && info[0]->IsNumber() && info[1]->IsNumber())
      {
        originalPoint.x = Nan::To<double>(info[0]).FromMaybe(0);
        originalPoint.y = Nan::To<double>(info[1]).FromMaybe(0);

        Point2f transformedPoint = obj->pCalib->onPoint(originalPoint);
        
        returnPoint2f(info, transformedPoint);
      }
      else if (info.Length() == 1 && info[0]->IsObject())
      {
        v8::Local<v8::Object> pointObj = Nan::To<v8::Object>(info[0]).ToLocalChecked();

        if (isLocalPointObject(pointObj))
        {
          originalPoint = localObjectToPoint2f(pointObj);

          Point2f transformedPoint = obj->pCalib->onPoint(originalPoint);

          returnPoint2f(info, transformedPoint);
        }
        else 
        {
          Nan::ThrowTypeError("Object is not a point object.");
        }
      }
      else
      {
        Nan::ThrowTypeError("This method accepts two string, two number or an object type.");
      }
    }
  }
  else
  {
    Nan::ThrowError("PerspectiveCalibration object not loaded.");
  }
}

// bool loadImageDistance(Object{"x" : Number, "y" : Number} origin)
NAN_METHOD(ICameraTool::loadImageDistance)
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());

  if (info.Length() == 1 && info[0]->IsObject())
  {
    v8::Local<v8::Object> localOrigin = Nan::To<v8::Object>(info[0]).ToLocalChecked();

    if (isLocalPointObject(localOrigin))
    {
      Point2f origin = localObjectToPoint2f(localOrigin);
      obj->imgDst = make_shared<ImageDistance>(obj->lCalib, obj->pCalib, origin);

      info.GetReturnValue().Set(Nan::New<v8::Boolean>(obj->imgDst ? obj->imgDst->isReady() : false));
    }
    else
    {
      Nan::ThrowTypeError("Object is not a point object.");
    }   
  }
  else
  {
    Nan::ThrowTypeError("This method accepts a point object type.");
  }
}

// bool setImageOrigin(Object{"x" : Number, "y" : Number} origin)
NAN_METHOD(ICameraTool::setImageOrigin)
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());

  // Check argument types
  int overloadSignature = -1;
  v8::Local<v8::Object> pointObj;

  if (info.Length() == 1 && info[0]->IsObject())
  {
    pointObj = Nan::To<v8::Object>(info[0]).ToLocalChecked();
    if (isLocalPointObject(pointObj))
    {
      overloadSignature = 0;
    }
    else
    {
      Nan::ThrowTypeError("Object is not a point object.");
      return;
    }
  }
  else
  {
    Nan::ThrowTypeError("This method accepts a point object type.");
    return;
  }

  Point2f origin;

  switch (overloadSignature)
  {
    case 0:
    origin = localObjectToPoint2f(pointObj);
    obj->imgDst->setOrigin(origin);
    break;

    default:
    Nan::ThrowRangeError("Overload signature is not valid.");
    return;
  }

  info.GetReturnValue().Set(Nan::New<v8::Boolean>(obj->imgDst->setOrigin(origin)));

  return;
}

// bool getRealCoordinate(Object{"x" : Number, "y" : Number} coordinate)
NAN_METHOD(ICameraTool::getRealCoordinate)
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());

  // Check argument types
  int overloadSignature = -1;
  v8::Local<v8::Object> pointObj;

  if (info.Length() == 1 && info[0]->IsObject())
  {
    pointObj = Nan::To<v8::Object>(info[0]).ToLocalChecked();
    if (isLocalPointObject(pointObj))
    {
      overloadSignature = 0;
    }
    else
    {
      Nan::ThrowTypeError("Object is not a point object.");
      return;
    }
  }
  else
  {
    Nan::ThrowTypeError("This method accepts a point object type.");
    return;
  }

  Point2f coordinate;

  switch (overloadSignature)
  {
    case 0:
    coordinate = localObjectToPoint2f(pointObj);
    break;

    default:
    Nan::ThrowRangeError("Overload signature is not valid.");
    return;
  }

  Point2f realCoordinates = obj->imgDst->getRealCoordinate(coordinate);

  returnPoint2f(info, realCoordinates);

  return;
}

// Object{"x" : Number, "y" : Number} getRealDistance(Object{"x" : Number, "y" : Number} from, Object{"x" : Number, "y" : Number} to)
NAN_METHOD(ICameraTool::getRealDistance)
{
  ICameraTool* obj = Nan::ObjectWrap::Unwrap<ICameraTool>(info.Holder());

  v8::Local<v8::Object> pointObj1;
  v8::Local<v8::Object> pointObj2;
  Point2f coordinate1;
  Point2f coordinate2;

  // Check argument types
  int overloadSignature = -1;

  if (info.Length() == 2 && info[0]->IsObject() && info[1]->IsObject())
  {
    pointObj1 = Nan::To<v8::Object>(info[0]).ToLocalChecked();
    pointObj2 = Nan::To<v8::Object>(info[1]).ToLocalChecked();
    if (isLocalPointObject(pointObj1) && isLocalPointObject(pointObj2))
    {
      overloadSignature = 0;
    }
    else
    {
      Nan::ThrowTypeError("Object is not a point object.");
      return;
    }
  }
  else
  {
    Nan::ThrowTypeError("This method accepts a point object and a point object type.");
    return;
  }

  switch (overloadSignature)
  {
    case 0:
      coordinate1 = localObjectToPoint2f(pointObj1);
      coordinate2 = localObjectToPoint2f(pointObj2);
      break;

    default:
      Nan::ThrowRangeError("Overload signature is not valid.");
      return;
  }

  info.GetReturnValue().Set(Nan::New<v8::Number>(obj->imgDst->getRealDistance(coordinate1, coordinate2)));

  return;
}

Nan::Persistent<v8::Function> ICameraTool::constructor;