import React, { useState } from 'react';
import { Card, Button, Menu, MenuItem, Box, IconButton, Typography } from '@mui/material';
import { Heart, Star, Share2, Copy, Check, Twitter, Facebook } from 'lucide-react';

interface QuoteWithInteractions {
  id: number;
  content: string;
  author: string;
  totalLikes: number;
  averageRating: number;
  liked: boolean;
  userRating: number;
}

interface QuoteCardProps {
  quote: QuoteWithInteractions;
  onLike: () => void;
  onRate: (rating: number) => void;
}

export function QuoteCard({ quote, onLike, onRate }: QuoteCardProps) {
  const [copied, setCopied] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClickShare = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseShareMenu = () => {
    setAnchorEl(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${quote.content}" - ${quote.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`"${quote.content}" - ${quote.author}`);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
    handleCloseShareMenu();
  };

  const shareToFacebook = () => {
    const text = encodeURIComponent(`"${quote.content}" - ${quote.author}`);
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
    handleCloseShareMenu();
  };

  return (
    <Card sx={{ p: { xs: 2, sm: 3 }, transition: 'box-shadow 300ms', '&:hover': { boxShadow: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography
          component="blockquote"
          sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, fontStyle: 'italic', m: 0 }}
        >
          "{quote.content}"
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography component="cite" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            — {quote.author}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Button
              variant="text"
              size="small"
              onClick={onLike}
              startIcon={<Heart size={16} fill={quote.liked ? '#ef4444' : 'none'} />}
              sx={{ color: quote.liked ? '#ef4444' : 'text.secondary', p: { xs: 0.5, sm: 1 } }}
            >
              {quote.totalLikes}
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton key={star} onClick={() => onRate(star)} size="small">
                  <Star
                    size={16}
                    fill={star <= quote.userRating ? '#facc15' : 'none'}
                    stroke={star <= quote.userRating ? '#facc15' : 'currentColor'}
                    style={{ color: '#9ca3af' }}
                  />
                </IconButton>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="text"
              size="small"
              onClick={handleCopy}
              startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
              sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              id={`share-button-${quote.id}`}
              aria-controls={open ? `share-menu-${quote.id}` : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              variant="text"
              size="small"
              onClick={handleClickShare}
              startIcon={<Share2 size={16} />}
              sx={{ color: 'text.secondary' }}
            >
              Share
            </Button>
            <Menu
              id={`share-menu-${quote.id}`}
              anchorEl={anchorEl}
              open={open}
              onClose={handleCloseShareMenu}
              MenuListProps={{ 'aria-labelledby': `share-button-${quote.id}` }}
            >
              <MenuItem onClick={shareToTwitter} sx={{ display: 'flex', gap: 1 }}>
                <Twitter size={16} /> Share on Twitter
              </MenuItem>
              <MenuItem onClick={shareToFacebook} sx={{ display: 'flex', gap: 1 }}>
                <Facebook size={16} /> Share on Facebook
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
