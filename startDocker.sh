#! /bin/sh

docker build -t ebooks-api . \
&& docker run -it \
--mount type=bind,source="$(pwd)"/configs,target=/usr/app/configs \
--mount type=bind,source="$(pwd)"/logs,target=/usr/app/logs  \
--mount type=bind,source="$(pwd)"/ebooks,target=/usr/app/ebooks  \
-p 127.0.0.1:8082:8082 ebooks-api
