#! /bin/bash

for ebook in ./ebooks/*.epub 
do
	azw="${ebook%.*}.azw3"
	if [ ! -f "$azw" ]; then
		echo "$ebook"
	fi
done

