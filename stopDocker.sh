#! /bin/sh

docker rm $(docker kill $(docker ps -a -q --filter ancestor=ebooks-api --format="{{.ID}}"))
