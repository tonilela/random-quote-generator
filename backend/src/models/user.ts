import { Table, Column, Model, DataType, CreatedAt, BelongsToMany } from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import { Quote } from './quote';
import { QuoteLike } from './quoteLike';
import { QuoteRating } from './quoteRating';

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

@Table({
  tableName: 'users',
  timestamps: false,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'password_hash',
  })
  passwordHash!: string;

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  createdAt!: Date;

  @BelongsToMany(() => Quote, () => QuoteLike)
  likedQuotes!: Quote[];

  @BelongsToMany(() => Quote, () => QuoteRating)
  ratedQuotes!: Quote[];
}
