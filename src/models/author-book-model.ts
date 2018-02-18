import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize, Instance } from 'sequelize';

export interface AuthorBookAttributes {
  id: number;
  bookId: number;
  authorId: number;
};

export interface AuthorBookInstance extends Instance<AuthorBookAttributes> {
  dataValues: AuthorBookAttributes;
};

export default function(
  sequelize: Sequelize,
  dataTypes: DataTypes
): SequelizeStatic.Model<AuthorBookInstance, AuthorBookAttributes> {
  let authorBook:any = sequelize.define<AuthorBookInstance, AuthorBookAttributes>('AuthorBook', {
    id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookId: { type: dataTypes.INTEGER, allowNull: false, unique: 'authorBook' },
    authorId: { type: dataTypes.INTEGER, allowNull: false, unique: 'authorBook' },
    createdAt: { type: dataTypes.DATE },
    updatedAt: { type: dataTypes.DATE }
  }, {
    indexes: [],
    classMethods: {},
    timestamps: true,
    tableName: 'author_books'
  });

  authorBook['associate'] = function(models: any): void {
    authorBook.belongsTo(models.Book, {foreignKey: 'bookId'});
    authorBook.belongsTo(models.Author, {foreignKey: 'authorId'});
  };

  return authorBook;
}


export function setConstraint(models: any) {}
