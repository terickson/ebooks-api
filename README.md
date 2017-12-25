ebooks-api
===========
This api is used to get ebook information.

### Installation
1. If you don't already have it install node: I suggest [NVM](https://github.com/creationix/nvm)
1. Install typescript compiler tsc: npm install -g tsc
1. Install typescript definitions: npm install -g tsd
1. If you don't already have it install gulp: npm install -g gulp
1. If you don't already have ava: npm install --global ava
1. Then run: npm install
1. Optionally install Atom with the atom-typescript package...you can also use any other ide you want

### Run Locally
There are docker scripts to run locally.  You will need to create a configs directory and setup the configs from the sample-configs directory in that directory.  You will also need to create a logs directory.  After that you should be able to run the startDocker.sh file.

### Deploy
Run ./deploy -{{env}}
