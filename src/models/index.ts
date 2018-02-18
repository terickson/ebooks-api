import * as cls from "continuation-local-storage";
import * as fs from "fs";
import * as path from "path";
import * as SequelizeStatic from "sequelize";
import { properties } from "../utils/properties";
import { logger } from "../utils/logger";
import { Sequelize } from "sequelize";

class Database {
  private _basename: string;
  private _models: any;
  private _sequelize: Sequelize;

  constructor() {
    this._basename = path.basename(module.filename);

    if(properties.database.logging === true) {
      properties.database.logging =(sql)=>{logger.debug(sql);};
    }

    (SequelizeStatic as any).useCLS(cls.createNamespace("sequelize-transaction"));
    this._sequelize = new SequelizeStatic(properties.database.database, properties.database.username,
      properties.database.password, properties.database);
    this._sequelize.sync();
    let modelArr = ({} as any);

    fs.readdirSync(__dirname).filter((file: string) => {
      return file.indexOf("-model") !== -1;
    }).forEach((file: string) => {
      let model = this._sequelize.import(path.join(__dirname, file));
      modelArr[(model as any).name] = model;
    });

    Object.keys(modelArr).forEach((modelName: string) => {
      if(typeof modelArr[modelName].associate === 'function') {
        modelArr[modelName].associate(modelArr);
      }
    });

    this._models = (modelArr as any);
  }

  getModels() {
    return this._models;
  }

  getSequelize() {
    return this._sequelize;
  }
}

const database = new Database();
export const models = database.getModels();
export const sequelize = database.getSequelize();
