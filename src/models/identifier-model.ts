import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize, Instance } from 'sequelize';

export interface IdentifierAttributes {
  id: number;
  bookId: number;
  type: string;
  identifier: string;
};

export interface IdentifierInstance extends Instance<IdentifierAttributes> {
  dataValues: IdentifierAttributes;
};

export default function(
  sequelize: Sequelize,
  dataTypes: DataTypes
): SequelizeStatic.Model<IdentifierInstance, IdentifierAttributes> {
  let identifier:any = sequelize.define<IdentifierInstance, IdentifierAttributes>('Identifier', {
    id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookId: { type: dataTypes.INTEGER, allowNull: false},
    type: { type: dataTypes.STRING, allowNull: false, unique: 'book_ident' },
    identifier: { type: dataTypes.STRING, allowNull: false, unique: 'book_ident' },
    createdAt: { type: dataTypes.DATE },
    updatedAt: { type: dataTypes.DATE }
  }, {
    indexes: [],
    classMethods: {},
    timestamps: true,
    tableName: 'identifiers'
  });

  identifier['associate'] = function(models: any): void {
    identifier.belongsTo(models.Book, {foreignKey: 'bookId'});
  };

  return identifier;
}


export function setConstraint(models: any) {}
