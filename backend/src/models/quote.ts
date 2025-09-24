import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user';
import { QuoteLike } from './quoteLike';
import { QuoteRating } from './quoteRating';

@Table({
  tableName: 'quotes',
  timestamps: false,
})
export class Quote extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  author!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'total_likes',
  })
  totalLikes!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'total_ratings',
  })
  totalRatings!: number;

  @Column({
    type: DataType.DECIMAL(3, 2),
    defaultValue: 0,
    field: 'average_rating',
  })
  averageRating!: number;

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  createdAt!: Date;

  @HasMany(() => QuoteLike)
  likes!: QuoteLike[];

  @HasMany(() => QuoteRating)
  ratings!: QuoteRating[];

  @BelongsToMany(() => User, () => QuoteLike)
  likedByUsers!: User[];

  @BelongsToMany(() => User, () => QuoteRating)
  ratedByUsers!: User[];
}
