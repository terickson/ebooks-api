import {} from '../../custom-typings/json';

export class Properties{
  goodreadsInfo:any;
  database: any;
  logging: any;
  server: any;

  constructor() {
    let configDirectory = process.env.NODE_ENV === 'test' ? 'configs-sample' : 'configs'
    this.goodreadsInfo = require(`../../${configDirectory}/goodreads.json`);
    this.logging = require(`../../${configDirectory}/logging-config.json`);
    this.server = require(`../../${configDirectory}/server-config.json`);
    this.database = require(`../../${configDirectory}/database-config.json`);
  }
}

export const properties = new Properties();
