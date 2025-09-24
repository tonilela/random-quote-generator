import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';

import { QuoteCard } from '../QuoteComponents/QuoteCard';
import { SearchBar } from '../QuoteComponents/SearchBar';
import {
  getRandomQuote,
  likeQuote,
  rateQuote,
  getLikedQuotes,
  searchQuotes,
} from '../../services/api';

import { Shuffle } from 'lucide-react';

interface QuoteWithInteractions {
  id: number;
  content: string;
  author: string;
  tags?: string[];
  totalLikes: number;
  averageRating: number;
  liked: boolean;
  userRating: number;
}

type ViewMode = 'random' | 'search' | 'favorites';

export default function HomePage() {
  const [quotes, setQuotes] = useState<QuoteWithInteractions[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('random');

  const fetchRandomQuote = useCallback(async () => {
    setIsContentLoading(true);
    try {
      const randomQuote = await getRandomQuote();
      setQuotes([randomQuote]);
    } catch (error) {
      console.error('Failed to get random quote:', error);
      setQuotes([]);
    } finally {
      setIsContentLoading(false);
    }
  }, []);

  const fetchLikedQuotes = useCallback(async () => {
    setIsContentLoading(true);
    try {
      const likedQuotes = await getLikedQuotes();
      setQuotes(likedQuotes.map((q: any) => ({ ...q, liked: true })));
    } catch (error) {
      console.error('Failed to fetch liked quotes:', error);
      setQuotes([]);
    } finally {
      setIsContentLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        const randomQuote = await getRandomQuote();
        setQuotes([randomQuote]);
      } catch (error) {
        console.error('Initial load failed:', error);
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, []);

  useEffect(() => {
    if (loading) return;
    setSearchTerm('');

    const fetchContentForView = async () => {
      if (viewMode === 'random') {
        await fetchRandomQuote();
      } else if (viewMode === 'favorites') {
        await fetchLikedQuotes();
      } else if (viewMode === 'search') {
        setQuotes([]);
      }
    };
    fetchContentForView();
  }, [viewMode, loading, fetchRandomQuote, fetchLikedQuotes]);

  useEffect(() => {
    if (viewMode !== 'search' || searchTerm.trim().length < 2) {
      if (viewMode === 'search') setQuotes([]);
      return;
    }

    const searchTimer = setTimeout(() => {
      const performSearch = async () => {
        setIsContentLoading(true);
        try {
          const searchResults = await searchQuotes(searchTerm);
          setQuotes(searchResults);
        } catch (error) {
          console.error('Search failed:', error);
          setQuotes([]);
        } finally {
          setIsContentLoading(false);
        }
      };
      performSearch();
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchTerm, viewMode]);

  const handleLike = async (id: number, currentLikedStatus: boolean) => {
    try {
      const updatedQuoteFromServer = await likeQuote(id);
      if (viewMode === 'favorites' && currentLikedStatus) {
        setQuotes((prev) => prev.filter((q) => q.id !== id));
      } else {
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === id
              ? { ...q, liked: !q.liked, totalLikes: updatedQuoteFromServer.totalLikes }
              : q
          )
        );
      }
    } catch (error) {
      console.error('Handle like failed:', error);
    }
  };

  const handleRate = async (id: number, rating: number) => {
    try {
      const updatedQuoteFromServer = await rateQuote(id, rating);
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, userRating: rating, averageRating: updatedQuoteFromServer.averageRating }
            : q
        )
      );
    } catch (error) {
      console.error('Handle rate failed:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container component="main" maxWidth="md" sx={{ px: 2, py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'light', mb: 2 }}>
            {viewMode === 'favorites' && 'Your Favorite Quotes'}
            {viewMode === 'random' && 'Discover a Beautiful Quote'}
            {viewMode === 'search' && `Results for "${searchTerm}"`}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)} centered>
            <Tab label="Random" value="random" />
            <Tab label="Search" value="search" />
            <Tab label="Favorites" value="favorites" />
          </Tabs>
        </Box>

        {viewMode === 'search' && (
          <Box sx={{ mb: 4 }}>
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </Box>
        )}

        {viewMode === 'random' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Button
              variant="contained"
              onClick={fetchRandomQuote}
              startIcon={<Shuffle size={16} />}
              size="large"
            >
              Get New Quote
            </Button>
          </Box>
        )}

        <Box sx={{ minHeight: 200 }}>
          {isContentLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : quotes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary" variant="h6">
                {viewMode === 'favorites' && "You haven't liked any quotes yet."}
                {viewMode === 'random' && 'Could not fetch a quote. Please try again.'}
                {viewMode === 'search' && 'No quotes found. Please type to search.'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {quotes.map((quote) => (
                <Grid item xs={12} key={quote.id}>
                  <QuoteCard
                    quote={quote}
                    onLike={() => handleLike(quote.id, quote.liked)}
                    onRate={(rating) => handleRate(quote.id, rating)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
}
