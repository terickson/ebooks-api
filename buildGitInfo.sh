#!/bin/bash

echo "{ \"url\": \"`git config --get remote.origin.url`\" }" > gitInfo.json
