import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  Avatar,
  Typography,
  CircularProgress,
  Divider,
  Drawer,
  IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';

const ChatList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Chats', icon: <ChatIcon />, path: '/chats' },
    { text: 'Friends', icon: <PeopleIcon />, path: '/friends' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
  ];

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/matches', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.matches) {
          console.log('Fetched matches:', response.data.matches);
          setMatches(response.data.matches);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#EC4899' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
      p: 3
    }}>
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

      {/* Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            bgcolor: 'rgba(17, 17, 17, 0.95)',
            color: 'white',
            borderRight: '1px solid #333'
          }
        }}
      >
        <List>
          {sidebarItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(236, 72, 153, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#EC4899' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Typography variant="h4" sx={{ color: 'white', mb: 3, mt: 5 }}>
        Your Matches
      </Typography>

      {error && (
        <Typography sx={{ color: 'red', mb: 2 }}>
          {error}
        </Typography>
      )}

      <List sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        backdropFilter: 'blur(10px)'
      }}>
        {matches.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary={
                <Typography sx={{ color: 'white' }}>
                  No matches yet. Start swiping to find concert buddies!
                </Typography>
              }
            />
          </ListItem>
        ) : (
          matches.map((match, index) => (
            <Box key={match.id}>
              <ListItem 
                button
                onClick={() => navigate(`/chat/${match.id}`)}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={match.profilePicture}
                    sx={{ width: 50, height: 50 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ color: 'white' }}>
                      {match.username}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Click to start chatting
                    </Typography>
                  }
                />
              </ListItem>
              {index < matches.length - 1 && (
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              )}
            </Box>
          ))
        )}
      </List>
    </Box>
  );
};

export default ChatList; 