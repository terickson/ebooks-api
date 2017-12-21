#!/bin/bash

#Insert name into README from package.json
sed -n 's/.*"name": "\(.*\)",/\1/p' package.json > newREADME.md
echo '===========' >> newREADME.md
#Insert description into README from package.json
sed -n 's/.*"description": "\(.*\)",/\1/p' package.json >> newREADME.md
#Insert new line
echo '' >> newREADME.md
sed -i '' -e '/###/,$!d' README.md
#Create Markdown file from endpoints.json
cat endpoints.json | node_modules/markdown-table-cli/bin/md-table > endpoints.md
#Clear current endpoints table and insert new endpoints table
sed -e '/^\[\/\/\]/,/^\[\/\/\]/{/^\[\/\/\]/!{/^\[\/\/\]/!d;};}' -e '/"Begin API Endpoints"/r./endpoints.md' README.md >> newREADME.md
mv newREADME.md README.md
rm endpoints.md
