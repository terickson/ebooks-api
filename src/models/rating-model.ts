import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize, Instance } from 'sequelize';

export interface RatingAttributes {
  id: number;
  bookId: number;
  site: string;
  rating: string;
};

export interface RatingInstance extends Instance<RatingAttributes> {
  dataValues: RatingAttributes;
};

export default function(
  sequelize: Sequelize,
  dataTypes: DataTypes
): SequelizeStatic.Model<RatingInstance, RatingAttributes> {
  let rating:any = sequelize.define<RatingInstance, RatingAttributes>('Rating', {
    id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookId: { type: dataTypes.INTEGER, allowNull: false, unique: 'book_rating' },
    site: { type: dataTypes.STRING, allowNull: false, unique: 'book_rating' },
    rating: { type: dataTypes.STRING, allowNull: false },
    createdAt: { type: dataTypes.DATE },
    updatedAt: { type: dataTypes.DATE }
  }, {
    indexes: [],
    classMethods: {},
    timestamps: true,
    tableName: 'ratings'
  });

  rating['associate'] = function(models: any): void {
    rating.belongsTo(models.Book, {foreignKey: 'bookId'});
  };

  return rating;
}


export function setConstraint(models: any) {}
