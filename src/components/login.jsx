import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography, Alert, Container, Grid, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { inputStyles } from './signup';

const Login = () => {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Attempting login...');
      const response = await axios.post('http://localhost:5001/login', data);
      console.log('Login response:', response.data);

      // Store the token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token stored:', response.data.token);
      } else {
        console.error('No token received in login response');
      }

      setSnackbar({
        open: true,
        message: 'Login successful!',
        severity: 'success'
      });

      // Delay navigation slightly to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Login failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      }}
    >
      <Container maxWidth="md">
        <Grid container sx={{ 
          backgroundColor: '#fff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}>
          {/* Left Side - Welcome Message */}
          <Grid item xs={12} md={6} sx={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: 'white',
          }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Find and Meet Concert Lovers.
            </Typography>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6} sx={{ p: 4, backgroundColor: 'white' }}>
            <Box sx={{ maxWidth: '400px', mx: 'auto' }}>
              <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', color: '#333' }}>
                User Login
              </Typography>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <PersonOutlineIcon sx={{ 
                    position: 'absolute', 
                    left: 8, 
                    top: 12,
                    color: '#8B5CF6'
                  }} />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Enter a valid email address',
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={inputStyles}
                  />
                </Box>

                <Box sx={{ position: 'relative', mb: 3 }}>
                  <LockOutlinedIcon sx={{ 
                    position: 'absolute', 
                    left: 8, 
                    top: 12,
                    color: '#8B5CF6'
                  }} />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={inputStyles}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                    },
                  }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              {snackbar.open && (
                <Snackbar
                  open={snackbar.open}
                  autoHideDuration={6000}
                  onClose={handleCloseSnackbar}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                  <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                  </Alert>
                </Snackbar>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
