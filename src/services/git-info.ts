import fs = require('fs');

let gitInfoFile:string = '/var/atc/atc-users/gitInfo.json';
let localGitInfoFile:string = '../../gitInfo.json';
let git:any = null;

if(fs.existsSync(gitInfoFile)) {
  git = require(gitInfoFile);
} else {
  git = require(localGitInfoFile);
}

export const gitInfo = git;
