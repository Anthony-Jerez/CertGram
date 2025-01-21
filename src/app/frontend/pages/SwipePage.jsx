import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Avatar,
  Container,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion, AnimatePresence } from 'framer-motion';

const SwipePage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchPotentialMatches = async () => {
    try {
      setLoading(true);
      console.log('Fetching matches for event:', eventId);

      const response = await axios.get(
        `http://localhost:5001/matchmaking/potential-matches/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('Matches response:', response.data);

      if (response.data.matches && response.data.matches.length > 0) {
        setPotentialMatches(response.data.matches);
        setCurrentIndex(0);
        setError(null);
      } else {
        navigate('/search-results', { 
          state: { 
            error: {
              message: 'No potential matches found for this event. Try again later!',
              severity: 'info'
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching matches:', error.response?.data || error);
      setError(error.response?.data?.error || 'Failed to fetch potential matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPotentialMatches();
  }, [eventId]);

  const handleSwipe = async (direction) => {
    try {
      await axios.post('http://localhost:5001/matchmaking/swipe', {
        eventId,
        matchUserId: potentialMatches[currentIndex].userId,
        direction
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      setError('Failed to process swipe');
    }
  };

  // When user has swiped through all current matches
  const handleNoMoreMatches = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          You've viewed all potential matches!
        </Typography>
        <IconButton
          onClick={fetchPotentialMatches}
          sx={{
            backgroundColor: '#8B5CF6',
            color: 'white',
            '&:hover': {
              backgroundColor: '#7C3AED'
            },
            p: 2
          }}
        >
          <RefreshIcon sx={{ fontSize: '2rem' }} />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Click to check for new matches
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#EC4899' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          onClick={() => navigate('/search-results')}
          sx={{ mt: 2 }}
        >
          Back to Search
        </Button>
      </Box>
    );
  }

  // Show refresh option when all matches have been viewed
  if (currentIndex >= potentialMatches.length) {
    return handleNoMoreMatches();
  }

  // Your existing swipe card rendering logic here
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
      py: 4
    }}>
      <Container maxWidth="sm">
        <AnimatePresence>
          {potentialMatches[currentIndex] && (
            <motion.div
              key={potentialMatches[currentIndex].userId}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card sx={{ 
                maxWidth: 600,
                margin: 'auto',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={potentialMatches[currentIndex].profilePicture}
                    sx={{ 
                      width: '100%', 
                      height: 400, 
                      borderRadius: '20px 20px 0 0'
                    }}
                    variant="square"
                  />
                </Box>
                
                <CardContent sx={{ color: 'white' }}>
                  <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                    {potentialMatches[currentIndex].username}, {new Date().getFullYear() - new Date(potentialMatches[currentIndex].age).getFullYear()}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<MusicNoteIcon />}
                      label={`Favorite Artist: ${potentialMatches[currentIndex].favouriteArtist}`}
                      sx={{ 
                        backgroundColor: 'rgba(236, 72, 153, 0.1)',
                        color: 'white',
                        mb: 1
                      }}
                    />
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {potentialMatches[currentIndex].aboutMe}
                  </Typography>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    mt: 2 
                  }}>
                    <IconButton 
                      onClick={() => handleSwipe('left')}
                      sx={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.3)' }
                      }}
                    >
                      <CloseIcon sx={{ color: '#EF4444', fontSize: 30 }} />
                    </IconButton>

                    <IconButton 
                      onClick={() => handleSwipe('right')}
                      sx={{ 
                        backgroundColor: 'rgba(52, 211, 153, 0.2)',
                        '&:hover': { backgroundColor: 'rgba(52, 211, 153, 0.3)' }
                      }}
                    >
                      <FavoriteIcon sx={{ color: '#34D399', fontSize: 30 }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default SwipePage;