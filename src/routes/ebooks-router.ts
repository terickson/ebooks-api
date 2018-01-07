import { routeSetup, RouteInfo } from '../services/routeSetup';
import {Request, Response, Router} from "express";
import {logger} from "../utils/logger";
export let router: Router = Router();

router.get('/', function findById(req: Request, res: Response, next: Function) {
  try{
    res.json({"message": "Hello World."});
  }catch(error){
    res.status(412);
    res.json({error:error.message});
    return;
  }
});
let getEbooksInfo:RouteInfo = new RouteInfo('Ebooks');
getEbooksInfo.description = "This will get all ebooks";
routeSetup.addRouteToSwaggerDoc('/ebooks/', 'get', getEbooksInfo);
