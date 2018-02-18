import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize, Instance } from 'sequelize';

export interface SubjectAttributes {
  id: number;
  bookId: number;
  subject: string;
};

export interface SubjectInstance extends Instance<SubjectAttributes> {
  dataValues: SubjectAttributes;
};

export default function(
  sequelize: Sequelize,
  dataTypes: DataTypes
): SequelizeStatic.Model<SubjectInstance, SubjectAttributes> {
  let subject:any = sequelize.define<SubjectInstance, SubjectAttributes>('Subject', {
    id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookId: { type: dataTypes.INTEGER, allowNull: false, unique: 'subject' },
    subject: { type: dataTypes.STRING, allowNull: false, unique: 'subject' },
    createdAt: { type: dataTypes.DATE },
    updatedAt: { type: dataTypes.DATE }
  }, {
    indexes: [],
    classMethods: {},
    timestamps: true,
    tableName: 'subjects'
  });

  subject['associate'] = function(models: any): void {
    subject.belongsTo(models.Book, {foreignKey: 'bookId'});
  };

  return subject;
}


export function setConstraint(models: any) {}
