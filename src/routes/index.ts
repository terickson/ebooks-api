import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { properties } from '../utils/properties';
import { routeSetup } from '../services/routeSetup';
import { logger, skip, stream } from '../utils/logger';
import { Express, Request, Response, Router } from 'express';
import * as cors from 'cors';
import * as _ from 'lodash';
let queryParams = require('express-query-params');
const swaggerUi = require('swagger-ui-express');

export let app: Express = express();
let corsOptions:cors.CorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
};

app.use(compression());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev", {skip: skip, stream: <any>stream}));
app.use(express.static(path.join(__dirname, '../public')));

// used to make all requests cors safe
app.use(cors(corsOptions));

app.use(queryParams());

function toLower(x: string) {
  return x.toLowerCase();
}

app.use('/apiDocs', swaggerUi.serve, swaggerUi.setup(null, false, {validatorUrl : null}, null, null, '/'));
//add dynamic routes
fs.readdirSync(__dirname).filter((file: string) => {
  return file.indexOf("-router") !== -1;
}).forEach((file: string) => {
  let route = require(path.join(__dirname, file)).router;
  let name = file.split('-router')[0]
  app.use('/' + name, route);
});

let swaggerRouter: Router = Router();
swaggerRouter.get('/', function(req: Request, res: Response, next: Function) {
   res.json(routeSetup.getSwaggeDoc());
});
app.use('/', swaggerRouter);

app.use((err: Error, req: Request, res: Response, next: Function) => {
  let errMsg = {message: err.message || "Server error please contact your administrator"};
  logger.error("Error During Operation: ", err);
  return res.status(500).json(errMsg);
});
