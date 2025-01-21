import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  MenuItem,
  Snackbar,
  Alert,
  Avatar,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress
} from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const schema = yup.object({
  aboutMe: yup.string()
    .required('About me is required')
    .min(10, 'About me must be at least 10 characters')
    .max(500, 'About me cannot exceed 500 characters'),
  interests: yup.string()
    .required('Interests are required'),
  favouriteArtist: yup.string()
    .required('Favourite artist is required'),
  gender: yup.string()
    .required('Gender is required'),
});

const ProfilePage = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [editField, setEditField] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema)
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleEditClick = (field) => {
    setEditField(field);
    setOpenModal(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      setSnackbar({
        open: true,
        message: 'Please log in to view your profile',
        severity: 'warning'
      });
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
        setPreviewUrl(response.data.profile_picture_url);
        
        // Set initial form values
        setValue('aboutMe', response.data.about_me);
        setValue('interests', response.data.interests?.join(', '));
        setValue('favouriteArtist', response.data.favourite_artist?.join(', '));
        setValue('gender', response.data.gender);
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setSnackbar({
          open: true,
          message: 'Failed to load profile data',
          severity: 'error'
        });
      }
    };

    fetchUserData();
  }, [setValue, navigate]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        const token = localStorage.getItem('token');
        console.log('Token being sent:', token);
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const uploadResponse = await axios.post('http://localhost:5001/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Upload response:', uploadResponse.data);

        setSnackbar({
          open: true,
          message: 'Profile picture updated successfully!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Upload error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          token: localStorage.getItem('token')
        });
        
        if (!localStorage.getItem('token')) {
          setSnackbar({
            open: true,
            message: 'Please log in again to update your profile picture',
            severity: 'error'
          });
        } else {
          setSnackbar({
            open: true,
            message: error.response?.data?.error || 'Failed to update profile picture',
            severity: 'error'
          });
        }
        
        setPreviewUrl(userData?.profile_picture_url);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFieldUpdate = async (fieldName) => {
    try {
      setLoading(true);
      const currentValue = watch(fieldName);
      let updateData = {};

      switch (fieldName) {
        case 'interests':
        case 'favouriteArtist':
          updateData[fieldName] = currentValue.split(',').map(item => item.trim());
          break;
        default:
          updateData[fieldName] = currentValue;
      }

      await axios.patch('http://localhost:5001/profile', updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSnackbar({
        open: true,
        message: `${fieldName} updated successfully!`,
        severity: 'success'
      });
      setEditState({ ...editState, [fieldName]: false });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to update ${fieldName}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (fieldName, label, multiline = false) => {
    const isEditing = editState[fieldName];
    const currentValue = watch(fieldName);
    const originalValue = userData?.[fieldName];

    return (
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={isEditing ? 10 : 11}>
          {isEditing ? (
            <TextField
              fullWidth
              label={label}
              multiline={multiline}
              rows={multiline ? 4 : 1}
              {...register(fieldName)}
              error={!!errors[fieldName]}
              helperText={errors[fieldName]?.message}
            />
          ) : (
            <Typography>{currentValue || 'Not set'}</Typography>
          )}
        </Grid>
        <Grid item xs={1}>
          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={() => handleFieldUpdate(fieldName)}
                disabled={loading}
                color="primary"
              >
                <SaveIcon />
              </IconButton>
              <IconButton 
                onClick={() => {
                  setValue(fieldName, originalValue);
                  setEditState({ ...editState, [fieldName]: false });
                }}
                color="error"
              >
                <CancelIcon />
              </IconButton>
            </Box>
          ) : (
            <IconButton 
              onClick={() => setEditState({ ...editState, [fieldName]: true })}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
    );
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.patch('http://localhost:5001/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUserData(response.data.user);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      setOpenModal(false);

    } catch (error) {
      console.error('Profile update error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      py: 6
    }}>
      <IconButton
        onClick={() => navigate('/dashboard')}
        sx={{
          position: 'fixed',
          top: 20,
          left: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
          zIndex: 1200,
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: '25px',
            textAlign: 'center',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              zIndex: 0
            }
          }}
        >
          {/* Profile Section */}
          <Box sx={{ 
            position: 'relative', 
            mb: 6,
            zIndex: 1 
          }}>
            <Avatar
              src={previewUrl}
              sx={{
                width: 180,
                height: 180,
                margin: '0 auto',
                border: '4px solid white',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05) rotate(5deg)',
                  cursor: 'pointer',
                  boxShadow: '0 12px 28px rgba(236, 72, 153, 0.4)'
                }
              }}
              onClick={() => document.getElementById('profile-picture').click()}
            />
            <Typography 
              variant="h4" 
              sx={{ 
                mt: 3,
                fontWeight: '600',
                color: '#1a1a1a',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {userData?.username || 'Loading...'}
            </Typography>
          </Box>

          {/* Action Buttons with enhanced styling */}
          <Grid 
            container 
            spacing={4} 
            justifyContent="center" 
            sx={{ mb: 4 }}
          >
            {[
              { icon: <SettingsIcon />, label: 'SETTINGS', onClick: () => navigate('/settings') },
              { icon: <EditIcon />, label: 'EDIT PROFILE', onClick: () => setOpenModal(true) },
              { icon: <SecurityIcon />, label: 'SAFETY', onClick: () => {} }
            ].map((action, index) => (
              <Grid item key={index}>
                <IconButton 
                  sx={{ 
                    backgroundColor: action.label === 'EDIT PROFILE' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.8)',
                    width: 80,
                    height: 80,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px) scale(1.05)',
                      backgroundColor: action.label === 'EDIT PROFILE' ? '#7C3AED' : 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
                    }
                  }}
                  onClick={action.onClick}
                >
                  {React.cloneElement(action.icon, { 
                    sx: { 
                      fontSize: 32,
                      color: action.label === 'EDIT PROFILE' ? 'white' : '#8B5CF6'
                    } 
                  })}
                </IconButton>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mt: 1,
                    fontWeight: '500',
                    color: 'white',
                    fontSize: '0.875rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {action.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Edit Profile Modal */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '16px'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '24px',
          fontWeight: '500',
          pb: 1
        }}>
          Edit Profile
          <IconButton
            onClick={() => setOpenModal(false)}
            sx={{ 
              position: 'absolute', 
              right: 16, 
              top: 16
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 4 }}>
            <input
              type="file"
              hidden
              id="profile-picture"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
            <label htmlFor="profile-picture">
              <Avatar
                src={previewUrl}
                sx={{
                  width: 200,
                  height: 200,
                  margin: '0 auto',
                  cursor: 'pointer',
                  border: '4px solid #fe3d71',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
              />
            </label>
          </Box>

          <Grid container spacing={3}>
            {['aboutMe', 'interests', 'favouriteArtist', 'gender'].map((field) => (
              <Grid item xs={12} key={field}>
                <TextField
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                  {...register(field)}
                  error={!!errors[field]}
                  helperText={errors[field]?.message}
                  multiline={field === 'aboutMe'}
                  rows={field === 'aboutMe' ? 4 : 1}
                  select={field === 'gender'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '16px'
                    }
                  }}
                >
                  {field === 'gender' && [
                    <MenuItem key="male" value="male">Male</MenuItem>,
                    <MenuItem key="female" value="female">Female</MenuItem>,
                    <MenuItem key="other" value="other">Other</MenuItem>
                  ]}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenModal(false)}
            sx={{ 
              fontSize: '16px',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={loading}
            sx={{
              fontSize: '16px',
              px: 4,
              backgroundColor: '#fe3d71',
              '&:hover': {
                backgroundColor: '#e0355f'
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ fontSize: '16px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage; 