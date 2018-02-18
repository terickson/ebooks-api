import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize, Instance } from 'sequelize';

export interface AuthorAttributes {
  id: number;
  name: string;
};

export interface AuthorInstance extends Instance<AuthorAttributes> {
  dataValues: AuthorAttributes;
};

export default function(
  sequelize: Sequelize,
  dataTypes: DataTypes
): SequelizeStatic.Model<AuthorInstance, AuthorAttributes> {
  let author: any = sequelize.define<AuthorInstance, AuthorAttributes>('Author', {
    id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: dataTypes.STRING, allowNull: false, unique: true },
  }, {
    indexes: [],
    classMethods: {},
    timestamps: true,
    tableName: "authors"
  });

  author['associate'] = function(authors: any): void {
    author.hasMany(authors.AuthorBook, {foreignKey: 'authorId'});
  };

  return author;
}
