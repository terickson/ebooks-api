import {} from '../../custom-typings/json';
let loggingConfig: any = require('../../configs/logging-config.json');

export class Properties{

  logging: any;
  server: any;

  constructor(loggingCfg: any) {
    this.logging = loggingCfg;
  }
}

export const properties = new Properties(loggingConfig);
