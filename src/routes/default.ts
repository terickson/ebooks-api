import { endpoints } from '../services/endpoints';
import { packages } from '../services/package';
import { gitInfo } from '../services/git-info';
import { Express, Request, Response, Router } from 'express';
export let router: Router = Router();

router.get('/', function(req: Request, res: Response) {
  let details:any = {
    name: packages.name,
    description: packages.description,
    gitRepo: gitInfo.url,
    dependencies: packages.dependencies,
    endpoints: endpoints
  };
  res.json(details);
});
router.get('/dependencies', function(req: Request, res: Response) {
  res.json(packages.dependencies);
});
router.get('/endpoints', function(req: Request, res: Response) {
   res.json(endpoints);
});
