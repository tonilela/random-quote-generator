import { Op, fn, col } from 'sequelize';
import { Quote } from '../models/quote';
import { QuoteLike } from '../models/quoteLike';
import { QuoteRating } from '../models/quoteRating';

import { sequelize } from '../database/sequelize';

interface RatingStats {
  averageRating: string;
  totalRatings: string;
}

interface QuoteWithUserData {
  id: number;
  content: string;
  author: string;
  totalLikes: number;
  totalRatings: number;
  averageRating: number;
  createdAt: Date;
  liked: boolean;
  userRating: number;
}

interface QuoteWithIncludedRatings {
  id: number;
  content: string;
  author: string;
  totalLikes: number;
  totalRatings: number;
  averageRating: number;
  createdAt: Date;
  ratings?: Array<{ rating: number }>;
}

interface PaginatedQuotesResponse {
  quotes: QuoteWithUserData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

interface QuoteWithIncludes extends QuoteWithUserData {
  // These properties are added by the 'include' in searchQuotes
  // The names (e.g., QuoteLikes) are determined by your model names
  QuoteLikes?: { id: number }[];
  QuoteRatings?: { rating: number }[];
}

export const getRandomQuote = async ({
  userId,
}: {
  userId: string;
}): Promise<QuoteWithUserData> => {
  let quote: Quote | null = null;
  if (userId) {
    const likeCount = await QuoteLike.count({ where: { userId } });
    const ratingCount = await QuoteRating.count({ where: { userId } });
    if (likeCount + ratingCount < 5 && Math.random() < 0.5) {
      const topQuotes = await Quote.findAll({
        where: { averageRating: { [Op.gte]: 4.0 }, totalRatings: { [Op.gte]: 2 } },
      });
      if (topQuotes.length > 0) {
        const selectedQuote = topQuotes[Math.floor(Math.random() * topQuotes.length)];
        quote = selectedQuote || null;
      }
    }
  }
  if (!quote) {
    quote = await Quote.findOne({ order: sequelize.random() });
  }
  if (!quote) {
    throw new Error('No quotes found in the database.');
  }

  let userHasLiked = false,
    userRating = 0;
  if (userId) {
    const like = await QuoteLike.findOne({ where: { userId, quoteId: quote.id } });
    userHasLiked = !!like;
    const rating = await QuoteRating.findOne({ where: { userId, quoteId: quote.id } });
    userRating = rating ? rating.rating : 0;
  }

  const plainQuote = quote.get({ plain: true }) as QuoteWithUserData;
  return { ...plainQuote, liked: userHasLiked, userRating };
};

export const likeQuote = async ({
  userId,
  quoteId,
}: {
  userId: string;
  quoteId: number;
}): Promise<Quote> => {
  return sequelize.transaction(async (t) => {
    const quote = await Quote.findByPk(quoteId, { transaction: t });
    if (!quote) throw new Error('Quote not found');

    const [like, created] = await QuoteLike.findOrCreate({
      where: { userId, quoteId },
      transaction: t,
    });
    if (created) {
      await quote.increment('totalLikes', { by: 1, transaction: t });
    } else {
      await like.destroy({ transaction: t });
      await quote.decrement('totalLikes', { by: 1, transaction: t });
    }

    await quote.reload({ transaction: t });
    return quote;
  });
};

export const rateQuote = async ({
  userId,
  quoteId,
  rating,
}: {
  userId: string;
  quoteId: number;
  rating: number;
}): Promise<QuoteWithUserData> => {
  return sequelize.transaction(async (t) => {
    const quote = await Quote.findByPk(quoteId, { transaction: t });
    if (!quote) throw new Error('Quote not found');

    await QuoteRating.upsert({ userId, quoteId, rating }, { transaction: t });

    const stats = (await QuoteRating.findOne({
      where: { quoteId },
      attributes: [
        [fn('AVG', col('rating')), 'averageRating'],
        [fn('COUNT', col('rating')), 'totalRatings'],
      ],
      raw: true,
      transaction: t,
    })) as unknown as RatingStats;

    if (stats) {
      quote.averageRating = Number(parseFloat(stats.averageRating).toFixed(2));
      quote.totalRatings = parseInt(stats.totalRatings, 10);
      await quote.save({ transaction: t });
    }
    const like = await QuoteLike.findOne({
      where: { userId, quoteId },
      transaction: t,
    });
    const userHasLiked = !!like;

    const plainQuote = quote.get({ plain: true }) as QuoteWithUserData;
    return {
      ...plainQuote,
      liked: userHasLiked,
      userRating: rating,
    };
  });
};

export const searchQuotes = async ({
  searchTerm,
  userId,
  page,
}: {
  searchTerm: string;
  userId: string;
  page: number;
}): Promise<PaginatedQuotesResponse> => {
  const limit = 10;
  const offset = (page - 1) * limit;

  const includes = [];
  if (userId) {
    includes.push(
      { model: QuoteLike, where: { userId }, required: false, attributes: ['id'] },
      { model: QuoteRating, where: { userId }, required: false, attributes: ['rating'] }
    );
  }

  const { count, rows: foundQuotes } = await Quote.findAndCountAll({
    where: {
      [Op.or]: [
        { content: { [Op.iLike]: `%${searchTerm}%` } },
        { author: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    },
    limit,
    offset,
    include: includes,
    distinct: true,
  });

  const quotes = foundQuotes.map((quote) => {
    const plainQuote = quote.get({ plain: true }) as QuoteWithIncludes;
    const liked = !!(userId && plainQuote.QuoteLikes && plainQuote.QuoteLikes?.length > 0);
    const userRating = plainQuote.QuoteRatings?.[0]?.rating || 0;
    return { ...(plainQuote as QuoteWithUserData), liked, userRating };
  });

  return {
    quotes,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    },
  };
};

export const getLikedQuotes = async ({
  userId,
  page,
}: {
  userId: string;
  page: number;
}): Promise<PaginatedQuotesResponse> => {
  const limit = 10;
  const offset = (page - 1) * limit;

  const { count, rows: likedQuotesWithData } = await Quote.findAndCountAll({
    include: [
      { model: QuoteLike, where: { userId }, attributes: [], required: true },
      { model: QuoteRating, where: { userId }, attributes: ['rating'], required: false },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
    distinct: true,
  });

  const quotes = likedQuotesWithData.map((quote) => {
    const plainQuote = quote.get({ plain: true }) as QuoteWithIncludedRatings;
    const userRating = plainQuote.ratings?.[0]?.rating ?? 0;
    return { ...(plainQuote as QuoteWithUserData), liked: true, userRating };
  });

  return {
    quotes,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    },
  };
};
