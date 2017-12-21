import fs = require('fs');

let packageFile:string = '/var/atc/atc-users/package.json';
let localPackageFile:string = '../../package.json';
let pkg:any = null;

if(fs.existsSync(packageFile)) {
  pkg = require(packageFile);
} else {
  pkg = require(localPackageFile);
}

export const packages = pkg;
