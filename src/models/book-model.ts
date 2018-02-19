import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize, Instance } from 'sequelize';

export interface BookAttributes {
  id: number;
  isbn: string;
  file: string;
  title: string;
  series: string;
  series_index: number;
  description: string;
  publisher: string;
  publication_date: Date;
  language: string;
};

export interface BookInstance extends Instance<BookAttributes> {
  dataValues: BookAttributes;
};

export default function(
  sequelize: Sequelize,
  dataTypes: DataTypes
): SequelizeStatic.Model<BookInstance, BookAttributes> {
  let book: any = sequelize.define<BookInstance, BookAttributes>('Book', {
    id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    isbn: { type: dataTypes.STRING, allowNull: true},
    file: { type: dataTypes.STRING, allowNull: false, unique: true },
    title: { type: dataTypes.STRING, allowNull: false},
    series: { type: dataTypes.STRING, allowNull: true},
    series_index: { type: dataTypes.DECIMAL, allowNull: true},
    description: { type: dataTypes.TEXT, allowNull: true},
    publisher: { type: dataTypes.STRING, allowNull: true},
    publication_date: { type: dataTypes.DATE, allowNull: true},
    language: { type: dataTypes.STRING, allowNull: true},
    createdAt: { type: dataTypes.DATE },
    updatedAt: { type: dataTypes.DATE }
  }, {
    indexes: [],
    classMethods: {},
    timestamps: true,
    tableName: "books"
  });

  book['associate'] = function(books: any): void {
    book.hasMany(books.AuthorBook, {foreignKey: 'bookId'});
    book.hasMany(books.Identifier, {foreignKey: 'bookId'});
    book.hasMany(books.Rating, {foreignKey: 'bookId'});
    book.hasMany(books.Subject, {foreignKey: 'bookId'});
  };

  return book;
}
