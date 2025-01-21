import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventsDisplay from '../../../components/EventsDisplay';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import LogoutIcon from '@mui/icons-material/Logout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [events, setEvents] = useState(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const sidebarItems = [
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Chats', icon: <ChatIcon />, path: '/chats' },
    { text: 'Friends', icon: <PeopleIcon />, path: '/friends' },
    { text: 'Event', icon: <EventIcon />, path: '/events' },
  ];

  const handleNearMeClick = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get user's location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Then fetch events with the location
      const response = await axios.get('http://localhost:5001/events/nearby', {
        params: {
          latitude,
          longitude,
          radius: 50 // default radius in miles
        },
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data) {
        // Instead of setting local state, navigate to search results
        navigate('/search-results', { 
          state: { events: response.data }
        });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.name === 'GeolocationPositionError') {
        setError('Unable to get your location. Please enable location services and try again.');
      } else {
        setError('Failed to fetch events. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'MX', name: 'Mexico' }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5001/event/search?query=${searchQuery}&countryCode=${countryCode}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data._embedded && response.data._embedded.events && response.data._embedded.events.length > 0) {
        navigate('/search-results', { state: { events: response.data } });
      } else {
        setError(`No events found for "${searchQuery}" in ${countries.find(c => c.code === countryCode).name}`);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error searching events:', error);
      setError('Failed to search events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        width: '100vw',
        background: `url('/src/background.webp') no-repeat center center fixed`,
        backgroundSize: 'cover',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        },
      }}
    >
      {/* Menu Button */}
      <IconButton
        onClick={() => setDrawerOpen(true)}
        sx={{ 
          position: 'fixed', 
          top: 20, 
          left: 20, 
          color: 'white',
          zIndex: 1200,
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Pop-up Sidebar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          zIndex: 1300,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            bgcolor: 'rgba(17, 17, 17, 0.95)',
            color: 'white',
            borderRight: '1px solid #333',
            zIndex: 1300,
          },
          '& .MuiBackdrop-root': {
            zIndex: 1299,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon sx={{ color: '#8B5CF6' }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Dashboard
          </Typography>
        </Box>
        <List sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {sidebarItems.map((item) => (
            <ListItem
              component="button"
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(139, 92, 246, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#8B5CF6' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          <ListItem
            component="button"
            onClick={handleSignOut}
            sx={{
              marginTop: 'auto',
              '&:hover': {
                bgcolor: 'rgba(139, 92, 246, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#8B5CF6' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
      <Box 
        sx={{ 
          position: 'relative',
          zIndex: 2,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h1" 
          sx={{ 
            color: 'white',
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            position: 'relative',
            cursor: 'default',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              textShadow: '0 0 10px #8B5CF6, 0 0 20px #8B5CF6, 0 0 30px #8B5CF6',
              background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            },
          }}
        >
          MEET
        </Typography>
        <Typography 
          variant="h1" 
          sx={{ 
            color: 'white',
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            position: 'relative',
            cursor: 'default',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              textShadow: '0 0 10px #EC4899, 0 0 20px #EC4899, 0 0 30px #EC4899',
              background: 'linear-gradient(45deg, #EC4899, #8B5CF6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            },
          }}
        >
          YOUR
        </Typography>
        <Typography 
          variant="h1" 
          sx={{ 
            color: 'white',
            fontWeight: 'bold',
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            position: 'relative',
            cursor: 'default',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px) scale(1.05)',
              textShadow: '0 0 10px #8B5CF6, 0 0 20px #EC4899, 0 0 30px #8B5CF6',
              background: 'linear-gradient(45deg, #8B5CF6, #EC4899, #8B5CF6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '0.1em',
            },
          }}
        >
          CONCERT CREW
        </Typography>
      </Box>

      {/* Near Me Button and Search Bar Container */}
      <Box 
        sx={{ 
          position: 'fixed', 
          top: 20, 
          right: 20, 
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'flex-end'
        }}
      >
        {/* Existing Near Me Button */}
        <Button
          variant="contained"
          startIcon={<LocationOnIcon />}
          onClick={handleNearMeClick}
          disabled={loading}
          sx={{
            bgcolor: '#EC4899',
            borderRadius: '50px',
            px: 3,
            '&:hover': {
              bgcolor: '#D1366B',
            },
          }}
        >
          {loading ? 'Loading...' : 'NEAR ME'}
        </Button>

        {/* Search Bar with Country Selector */}
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
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
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#EC4899',
                },
                '& .MuiSvgIcon-root': {
                  color: 'white',
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

          <form onSubmit={handleSearch} style={{ flex: 1 }}>
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchQuery('')}
                      sx={{ color: 'white' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '25px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5) !important',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#EC4899 !important',
                  },
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }
              }}
              sx={{
                width: '300px',
                '& .MuiOutlinedInput-root': {
                  '& input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                },
              }}
            />
          </form>
        </Box>
      </Box>

      {/* Events Display */}
      {showEvents && events && (
        <Box sx={{ position: 'relative', zIndex: 2, px: 4 }}>
          <EventsDisplay events={events} />
        </Box>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
