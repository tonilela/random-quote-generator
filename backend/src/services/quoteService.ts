import { Op, fn, col } from 'sequelize';
import { Quote } from '../models/quote';
import { QuoteLike } from '../models/quoteLike';
import { QuoteRating } from '../models/quoteRating';

import { sequelize } from '../database/sequelize';

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

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

export const getRandomQuote = async (
  user: AuthenticatedUser | null
): Promise<QuoteWithUserData> => {
  let quote: Quote | null = null;
  if (user) {
    const likeCount = await QuoteLike.count({ where: { userId: user.id } });
    const ratingCount = await QuoteRating.count({ where: { userId: user.id } });
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
  if (user) {
    const like = await QuoteLike.findOne({ where: { userId: user.id, quoteId: quote.id } });
    userHasLiked = !!like;
    const rating = await QuoteRating.findOne({ where: { userId: user.id, quoteId: quote.id } });
    userRating = rating ? rating.rating : 0;
  }

  const plainQuote = quote.get({ plain: true }) as QuoteWithUserData;
  return { ...plainQuote, liked: userHasLiked, userRating };
};

export const likeQuote = async (userId: string, quoteId: number): Promise<Quote> => {
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

export const rateQuote = async (
  userId: string,
  quoteId: number,
  rating: number
): Promise<QuoteWithUserData> => {
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

export const searchQuotes = async (
  searchTerm: string,
  user: AuthenticatedUser | null
): Promise<QuoteWithUserData[]> => {
  const foundQuotes = await Quote.findAll({
    where: {
      [Op.or]: [
        { content: { [Op.iLike]: `%${searchTerm}%` } },
        { author: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    },
    limit: 20,
  });

  let responseQuotes: QuoteWithUserData[] = foundQuotes.map(
    (q) =>
      ({
        ...q.get({ plain: true }),
        liked: false,
        userRating: 0,
      }) as QuoteWithUserData
  );

  if (user && responseQuotes.length > 0) {
    const quoteIds = responseQuotes.map((q) => q.id);
    const likes = await QuoteLike.findAll({ where: { userId: user.id, quoteId: quoteIds } });
    const ratings = await QuoteRating.findAll({ where: { userId: user.id, quoteId: quoteIds } });
    const likedIds = new Set(likes.map((l) => l.quoteId));
    const ratingsMap = new Map(ratings.map((r) => [r.quoteId, r.rating]));

    responseQuotes = responseQuotes.map((quote) => ({
      ...quote,
      liked: likedIds.has(quote.id),
      userRating: ratingsMap.get(quote.id) || 0,
    }));
  }
  return responseQuotes;
};

export const getLikedQuotes = async (userId: string): Promise<QuoteWithUserData[]> => {
  const likedQuotesWithData = await Quote.findAll({
    include: [
      { model: QuoteLike, where: { userId }, attributes: [], required: true },
      { model: QuoteRating, where: { userId }, attributes: ['rating'], required: false },
    ],
    order: [['createdAt', 'DESC']],
  });

  return likedQuotesWithData.map((quote) => {
    const plainQuote = quote.get({ plain: true }) as QuoteWithIncludedRatings;
    const userRating =
      plainQuote.ratings && plainQuote.ratings.length > 0
        ? (plainQuote.ratings[0]?.rating ?? 0)
        : 0;

    return {
      id: plainQuote.id,
      content: plainQuote.content,
      author: plainQuote.author,
      totalLikes: plainQuote.totalLikes,
      totalRatings: plainQuote.totalRatings,
      averageRating: plainQuote.averageRating,
      createdAt: plainQuote.createdAt,
      liked: true,
      userRating,
    };
  });
};
