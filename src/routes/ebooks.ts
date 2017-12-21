import { Express, Request, Response, Router } from 'express';
export let router: Router = Router();

router.get('/', function findById(req: Request, res: Response, next: Function) {
  res.json({"message": "Hello World."});
  }catch(error){
    res.status(412);
    res.json({error:error.message});
    return;
  }
});
