import axios from 'axios';
import { sequelize } from '../database/sequelize';
import { Quote } from '../models/quote';

interface DummyJsonQuote {
  id: number;
  quote: string;
  author: string;
}

interface ApiResponse {
  quotes: DummyJsonQuote[];
  total: number;
  skip: number;
  limit: number;
}

async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting database seeding process...');
  try {
    await sequelize.authenticate();
    await Quote.sync();

    console.log('📡 Fetching all quotes from dummyjson.com...');
    const response = await axios.get<ApiResponse>('https://dummyjson.com/quotes?limit=1500');
    const allQuotes: DummyJsonQuote[] = response.data.quotes;
    console.log(`✅ Found ${allQuotes.length} quotes to process.`);

    let createdCount = 0;
    for (const externalQuote of allQuotes) {
      const [quote, created] = await Quote.findOrCreate({
        where: { id: externalQuote.id },
        defaults: {
          id: externalQuote.id,
          content: externalQuote.quote,
          author: externalQuote.author,
        },
      });

      if (created) {
        createdCount++;
        console.log(`- Created quote by ${quote.author}`);
      }
    }
    console.log(`\n🎉 Seeding complete! Created ${createdCount} new quotes.`);
  } catch (error) {
    console.error('❌ An error occurred during database seeding:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

void seedDatabase();
