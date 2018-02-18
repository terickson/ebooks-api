import { routeSetup, RouteInfo } from '../services/routeSetup';
import {Request, Response, Router} from "express";
import {logger} from "../utils/logger";
import {sync} from "../services/sync";
export let router: Router = Router();

router.post('/', function findById(req: Request, res: Response, next: Function) {
  try{
    res.json({"message": "running sync"});
    sync();
  }catch(error){
    res.status(412);
    res.json({error:error.message});
    return;
  }
});
let postSyncInfo:RouteInfo = new RouteInfo('Sync');
postSyncInfo.description = "This will sync ebooks with datastore";
routeSetup.addRouteToSwaggerDoc('/sync/', 'post', postSyncInfo);
