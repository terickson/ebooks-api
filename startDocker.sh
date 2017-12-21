#! /bin/sh

docker build -t ebooks-api . \
&& docker run -it \
--mount type=bind,source="$(pwd)"/configs,target=/usr/app/configs \
--mount type=bind,source="$(pwd)"/logs,target=/usr/app/logs  \
-p 127.0.0.1:8080:8080 ebooks-api
