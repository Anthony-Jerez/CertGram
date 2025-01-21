import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Alert,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import EventsDisplay from '../../../components/EventsDisplay';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState(location.state?.events || null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryCode, setCountryCode] = useState('US');

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    // ... other countries
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:5001/event/search`, {
        params: {
          query: searchQuery,
          countryCode: countryCode
        }
      });
      
      setEvents(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search events. Please try again.');
    }
  };

  const handleNearMeClick = () => {
    setIsLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await axios.get('http://localhost:5001/events/nearby', {
            params: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radius: 50
            }
          });
          
          setEvents(response.data);
        } catch (error) {
          console.error('Error fetching nearby events:', error);
          setError('Failed to fetch nearby events. Please try again.');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setError('Unable to determine your location');
        setIsLoadingLocation(false);
      }
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
      p: 4 
    }}>
      <Container>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4 
        }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ color: 'white' }}
          >
            Back to Dashboard
          </Button>

          {/* Search Controls */}
          <Box sx={{ display: 'flex', gap: 1, width: '50%' }}>
            <FormControl size="small">
              <Select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                sx={{
                  minWidth: 120,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<LocationOnIcon />}
              onClick={handleNearMeClick}
              disabled={isLoadingLocation}
              sx={{
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(236, 72, 153, 0.2)',
                },
              }}
            >
              {isLoadingLocation ? 'Locating...' : 'Near Me'}
            </Button>

            <form onSubmit={handleSearch} style={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                }}
              />
            </form>
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Events Display */}
        <EventsDisplay events={events} />

        {/* No Events Message */}
        {events && (!events._embedded || !events._embedded.events) && !error && (
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 4 }}>
            No events found. Try a different search.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default SearchResults; 