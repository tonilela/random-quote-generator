import { Sequelize } from 'sequelize-typescript';
import { config } from '../config/config';
import { Quote } from '../models/quote';
import { User } from '../models/user';
import { QuoteLike } from '../models/quoteLike';
import { QuoteRating } from '../models/quoteRating';

export const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  models: [Quote, User, QuoteLike, QuoteRating],
});

export async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    await sequelize.sync({ alter: true });
    console.log('🔄 All models were synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}
