import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user';
import { Quote } from './quote';

@Table({
  tableName: 'quote_likes',
  timestamps: true,
  updatedAt: false,
})
export class QuoteLike extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'user_id',
    allowNull: false,
  })
  userId!: string;

  @ForeignKey(() => Quote)
  @Column({
    type: DataType.INTEGER,
    field: 'quote_id',
    allowNull: false,
  })
  quoteId!: number;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Quote)
  quote!: Quote;
}
