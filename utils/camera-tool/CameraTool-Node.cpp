#include <nan.h>
#include "ICameraTool.hpp"

void Init(v8::Local<v8::Object> exports, v8::Local<v8::Object> module) {
  ICameraTool::Init(exports, module);
}

NODE_MODULE(CameraTool, Init)