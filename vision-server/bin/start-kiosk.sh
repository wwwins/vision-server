#!/bin/sh
#
# Copyright 2018 isobar. All Rights Reserved.
#

# Setup ip and tag
EXT_IP="10.65.17.52"
INT_IP="10.65.17.52"
TAG="1.9.3"
ALPHA_BLEND="1.0"
BRIGHTNESS="1.2"
SATURATION="1.1"

echo "Starting isobar vision server v$TAG"
docker run -dit --restart unless-stopped --name isobar-kiosk -e EXT_IP=$EXT_IP -e INT_IP=$INT_IP -e ALPHA_BLEND=$ALPHA_BLEND -e MOBILE=0 -e BRIGHTNESS=$BRIGHTNESS -e SATURATION=$SATURATION -p 8080:8080 -v /home/cphuang72/public:/home/listerine-2019/vision-server/public isobar/docker-python-nodejs-opencv-dlib-vision:$TAG

