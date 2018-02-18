import { packages } from './package';
import { gitInfo } from './git-info';
import * as _ from 'lodash';
import { logger } from '../utils/logger';
const definition = require('sequelize-json-schema');

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

  addModelSwaggerDoc(pathName:string, model:string, models:any){
    let modelDefinition = definition(models[model]);
    delete modelDefinition.properties.id;
    delete modelDefinition.properties.createdBy;
    delete modelDefinition.properties.updatedBy;
    delete modelDefinition.properties.createdAt;
    delete modelDefinition.properties.updatedAt;
    delete modelDefinition.properties.created_at;
    delete modelDefinition.properties.updated_at;
    _.remove(modelDefinition.required, function (require) {
      return _.indexOf(['id', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'created_at', 'updated_at'], require) !== -1
    });
    this.swagger.definitions[model] = modelDefinition;
    let refs:string[] = Object.keys(models[model].associations);
    let params:any[] = [];
    for(let attKey in models[model].rawAttributes){
      params.push(
        {
          "name": attKey,
          "in": "query",
          "description": "You can use comma's between elements to query for multiple elements",
          "required": false,
          "type": "string"
        }
      );
    }

    this.swagger.paths[pathName] = {};
    this.swagger.paths[pathName + "/{id}"] = {};
    this.swagger.paths[pathName]["get"] = {
      "x-swagger-router-controller": model,
      "operationId": "index",
      "tags": [model],
      "description": "",
      "parameters":[{
                 "name": "limit",
                 "in": "query",
                 "description": "Limit the results coming back.",
                 "required": false,
                 "type": "integer"
               },
               {
                 "name": "offset",
                 "in": "query",
                 "description": "Sets the starting position of the results coming back.  Used in conjuntion with limit this allows for pagination",
                 "required": false,
                 "type": "integer"
               }],
      "responses": {}
    };

    if(refs.length > 0){
      this.swagger.paths[pathName]["get"]["parameters"].push(
        {
          "name": "includes",
          "in": "query",
          "description": "The available includes are: " + refs.join(', ') + ". You can use comma's between elements to query for multiple elements. Any includes on the lower level element are also available through dot notation to this object except for those objects that are plural they can only be referenced in the includes.  You can also query any attribute of a lower level element through dot notation, once again except for those plural objects.",
          "required": false,
          "type": "string"
        }
      );
      this.swagger.paths[pathName]["get"]["parameters"].push(
        {
          "name": "requireIncludes",
          "in": "query",
          "description": "If this is true it functions like an inner join meaning that it expects any included objects to also be present.  If false it acts like a left outer join.  If set to false plural includes will not work. If not passed this is considered true.",
          "required": false,
          "type": "boolean"
        }
      );
    }

    this.swagger.paths[pathName]["get"]["parameters"] = this.swagger.paths[pathName]["get"]["parameters"].concat(params);
    this.swagger.paths[pathName]["post"] = {
      "x-swagger-router-controller": model,
      "operationId": "index",
      "tags": [model],
      "description": "",
      "parameters":[{
                 "name": "body",
                 "in": "body",
                 "description": "",
                 "required": true,
                 "schema": {
                      "$ref": "#/definitions/" + model
                  }
               }],
      "responses": {}
    };
    this.swagger.paths[pathName + "/{id}"]["get"] = {
      "x-swagger-router-controller": model,
      "operationId": "index",
      "tags": [model],
      "description": "",
      "parameters":[{
                 "name": "id",
                 "in": "path",
                 "description": "",
                 "required": true,
                 "type": "integer"
               }],
      "responses": {}
    };
    this.swagger.paths[pathName + "/{id}"]["put"] = {
      "x-swagger-router-controller": model,
      "operationId": "index",
      "tags": [model],
      "description": "",
      "parameters":[{
                 "name": "id",
                 "in": "path",
                 "description": "",
                 "required": true,
                 "type": "integer"
               },{
                 "name": "body",
                 "in": "body",
                 "description": "",
                 "required": true,
                 "schema": {
                      "$ref": "#/definitions/" + model
                  }
               }],
      "responses": {}
    };
    this.swagger.paths[pathName + "/{id}"]["delete"] = {
      "x-swagger-router-controller": model,
      "operationId": "index",
      "tags": [model],
      "description": "",
      "parameters":[{
                 "name": "id",
                 "in": "path",
                 "description": "",
                 "required": true,
                 "type": "integer"
               }],
      "responses": {}
    };
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
