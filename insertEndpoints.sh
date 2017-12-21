#!/bin/bash

#Create Markdown file from endpoints.json
cat endpoints.json | node_modules/markdown-table-cli/bin/md-table > endpoints.md
#Clear current endpoints table and insert new endpoints table
sed -e '/^\[\/\/\]/,/^\[\/\/\]/{/^\[\/\/\]/!{/^\[\/\/\]/!d;};}' -e '/"Begin API Endpoints"/r./endpoints.md' README.md > newREADME.md
mv newREADME.md README.md
rm endpoints.md
