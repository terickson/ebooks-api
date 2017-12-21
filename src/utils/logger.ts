import * as path from 'path';
import { properties } from './properties';
import { transports, Logger, LoggerInstance } from 'winston';
import { Request, Response } from 'express';
import * as os from 'os';

export const logger: LoggerInstance = new Logger({
  transports: [
    new transports.Console(properties.logging.console)
  ],
  exitOnError: false
});
if(properties.logging.file){
  properties.logging.file.filename += '-' + os.hostname +'.log';
  logger.add(transports.File, properties.logging.file);
}

export const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

export const skip = (req: Request, res: Response): boolean => {
  return false;
};

export const stream = {
  write: (message: string, encoding: string): void => {
    logger.info(message);
  }
};
