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
import { models } from '../models/index';
let queryParams = require('express-query-params');
import { ValidationError }  from "sequelize";
const { ModelHandler } = require('sequelize-handlers');
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

// generate routes using sequelize-handlers for all models (except for those explicitly exempted)
let ignoreModelList = [];
for(let model in models) {
  if(ignoreModelList.includes(model)){
    continue;
  }
  let pathName = '/' + model + 's';
  let router: Router = Router();
  let handler = new ModelHandler(models[model]);

  router.get('/', handler.query());
  router.post('/', handler.create());
  router.get('/:id', handler.get());
  router.put('/:id', handler.update());
  router.delete('/:id', handler.remove());

  if(model === 'Book'){
    router.get('/:id/download', function(req, res, next){
      models.Book.find({ where: {id:  req.params.id} }).then((book)=>{
        if(!book){
          res.sendStatus(404);
          return;
        }
        var file = properties.server.ebooksDir + '/' + book.file + '.epub';
        res.download(file); // Set disposition and send it.
      },(error)=>{next(error); return;});
    });
  }

  app.use(pathName, router);
  routeSetup.addModelSwaggerDoc(pathName, model, models);
}

let swaggerRouter: Router = Router();
swaggerRouter.get('/', function(req: Request, res: Response, next: Function) {
   res.json(routeSetup.getSwaggeDoc());
});
app.use('/', swaggerRouter);

// error handler
app.use((err: any, req: Request, res: Response, next: Function) => {
  let errMsg: any = {message: err.message || "Server error please contact your administrator"};
  let statusCode: any = err.statusCode || 500

  if(typeof err.array === 'function') {
    // express-validator error
    errMsg.fields = err.array();
    return res.status(422).json(errMsg);
  } else if(err instanceof ValidationError){
    return res.status(422).json(errMsg);
  } else {
    return res.status(statusCode).json(errMsg);
  }
});
