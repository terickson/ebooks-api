import fs = require('fs');

let endpointsFile:string = '/var/atc/atc-users/endpoints.json';
let localEndpointsFile:string = '../../endpoints.json';
let props:any = null;

if(fs.existsSync(endpointsFile)) {
  props = require(endpointsFile);
} else {
  props = require(localEndpointsFile);
}

export const endpoints = props;
