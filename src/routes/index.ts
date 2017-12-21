import * as morgan from 'morgan';
import { logger, skip, stream } from '../utils/logger';
import * as compression from 'compression';
import * as cors from 'cors';
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import * as express from 'express';
import { Express, Request, Response, Router } from 'express';
import path = require('path');

export let app: Express = express();
let corsOptions:cors.CorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
};
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev", {skip: skip, stream: <any>stream}));
app.use(express.static(path.join(__dirname, '../public')));

// used to make all requests cors safe
app.use(cors(corsOptions));

// routes

import {router as defaultRoute} from './default';
import {router as ebookRoute} from './ebooks';

app.use('/', defaultRoute);
app.use('/ebooks', ebookRoute);

app.use((err: Error, req: Request, res: Response, next: Function) => {
  let errMsg = {message: err.message || "Server error please contact your administrator"};
  logger.error("Error During Operation: ", err);
  return res.status(500).json(errMsg);
});
