import { packages } from './package';
import { gitInfo } from './git-info';
import * as _ from 'lodash';
import { logger } from '../utils/logger';

export class RouteSetup{
  private swagger:any;

  constructor(){
    let gitUrl = (gitInfo.url.indexOf('https') !== -1)?gitInfo.url:gitInfo.url.replace(':','/').replace('git@', 'https://')
    this.swagger = {
      "swagger": "2.0",
       "info": {
         "title": packages.name,
         "description": packages.description,
         "version": "1.0"
       },
       "externalDocs":{
         "description": "Click for more info",
         "url": gitUrl
       },
       "produces": ["application/json"],
       "paths": {},
       "definitions": {}
     };
  }

  getSwaggeDoc(){
    return this.swagger;
  }

  addRouteToSwaggerDoc(route:string, method:string, routeInfo:RouteInfo, definitionName?:string, definition?:any){
    if(!this.swagger.paths[route]){
      this.swagger.paths[route] = {};
    }
    this.swagger.paths[route][method] = routeInfo;
    if(definitionName && definition){
      this.swagger.definitions[definitionName] = definition;
    }
  }


}




export class SwaggerParameter{
  public name:string;
  public in:string;
  public description:string;
  public required:boolean;
  public type: string;
  public schema:any;
}

export class RouteInfo{
  public "x-swagger-router-controller":string;
  public operationId:string = "index";
  public tags:string[];
  public description:string;
  public parameters:SwaggerParameter[];
  public responses:any = {};

  constructor(groupName:string){
    this["x-swagger-router-controller"] = groupName;
    this.tags = [groupName];
  }
}

export const routeSetup = new RouteSetup();
