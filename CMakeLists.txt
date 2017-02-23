cmake_minimum_required(VERSION 3.1)
project( CameraTool )

if(CYGWIN)
	set (CMAKE_FIND_LIBRARY_SUFFIXES ".a")
	set (BUILD_SHARED_LIBRARIES OFF)
	set (CMAKE_EXE_LINKER_FLAGS "-static")
endif()

if(WIN32)
	set (BUILD_SHARED_LIBRARIES OFF)
endif()

set (OpenCV_FIND_QUIETLY OFF)
set (CMAKE_CXX_STANDARD 14)

find_package( OpenCV REQUIRED )

file(GLOB SOURCES "utils/camera-tool/includes/*.cpp")
file(GLOB HEADERS "utils/camera-tool/includes/*.hpp")

add_executable( CameraTool utils/camera-tool/CameraTool.cpp ${SOURCES})
target_link_libraries( CameraTool ${OpenCV_LIBS} )

# Node Addon - Does not work properly due to OpenCV issues
#add_library(CameraTool-Node "utils/camera-tool/CameraTool-Node.cpp" "utils/camera-tool/node-interface/ICameraTool.cpp" ${SOURCES})
#set_target_properties(CameraTool-Node PROPERTIES PREFIX "" SUFFIX ".node")
#target_include_directories(CameraTool-Node PRIVATE ${CMAKE_JS_INC})
#target_link_libraries(CameraTool-Node ${CMAKE_JS_LIB} ${OpenCV_LIBS})