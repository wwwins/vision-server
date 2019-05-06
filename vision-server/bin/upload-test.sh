#!/bin/sh
#
# Copyright 2018 isobar. All Rights Reserved.
#

BG=false
OUTPUT=true
#HOST=http://34.80.23.177:8080/upload
#HOST=http://localhost:8080/upload
HOST=http://192.168.0.10:8080/upload
#HOST=http://localhost:8081/upload
#HOST=http://34.80.71.78:8080/upload
#HOST=http://10.140.0.2:8080/upload
#HOST=http://34.80.34.187:8080/upload

for f in *.jpg;
do
    echo "uploading $f"
    if [ $BG = true ]
    then
      curl --request POST --url $HOST -F "filename=@$f" &
    else
      if [ $OUTPUT = true ]
      then
        curl --request POST --url $HOST -F "filename=@$f" | jq -r '.cover' | xargs curl -s -o output/$f
      else
        curl --request POST --url $HOST -F "filename=@$f"
      fi
    fi
    echo "done"
#    sleep $(awk 'BEGIN { "date +%N" | getline seed; srand(seed); print rand(); }')
done;

# f=brady.jpg
# i=0
# while [ $i -lt 10 ]
# do
#     echo "uploading $f"
#     curl --request POST --url $HOST -F "filename=@$f" &
#     echo "done-$i"
#     i=$(($i + 1))
#     sleep $(awk 'BEGIN { "date +%N" | getline seed; srand(seed); print rand(); }')
# done;

