cmake_minimum_required(VERSION 3.1)
project( CameraTool )

if(CYGWIN)
	set (CMAKE_FIND_LIBRARY_SUFFIXES ".a")
	set (BUILD_SHARED_LIBRARIES OFF)
	set (CMAKE_EXE_LINKER_FLAGS "-static")
endif()

set (CMAKE_CXX_FLAGS "-Wall")
set (CMAKE_CXX_STANDARD 14)

find_package( OpenCV REQUIRED )
include_directories( ${OpenCV_INCLUDE_DIRS} )

file(GLOB SOURCES "utils/camera-tool/includes/*.cpp")
file(GLOB HEADERS "utils/camera-tool/includes/*.hpp")

add_executable( CameraTool utils/camera-tool/CameraTool.cpp ${SOURCES})
target_link_libraries( CameraTool ${OpenCV_LIBS} )
