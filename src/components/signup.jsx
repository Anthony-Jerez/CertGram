import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactConfetti from 'react-confetti';
import { 
  TextField,
  Alert,
  Container,
  Box,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Stack,
  Snackbar
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const schema = yup.object({
  username: yup.string()
    .required('Username is required')
    .max(20, 'Username cannot be longer than 20 characters'),
  email: yup.string()
    .required('Email is required')
    .email('Enter a valid email address'),
  dateOfBirth: yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future')
    .min(new Date(1900, 0, 1), 'Date of birth cannot be before 1900'),
  phoneNumber: yup.string()
    .required('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

const Signup = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/signup', data);
      setShowConfetti(true);
      setSnackbar({
        open: true,
        message: 'Account created successfully!',
        severity: 'success'
      });
      setTimeout(() => {
        setShowConfetti(false);
        navigate('/login');
      }, 3000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Signup failed. Please try again.',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 25%),
            radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.4) 0%, transparent 25%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="%23FFFFFF" fill-opacity="0.05"/%3E%3C/svg%3E")',
          opacity: 0.3,
          zIndex: 1,
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              p: 4,
              boxShadow: 3
            }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{
                mb: 4,
                background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Create Account
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <Box sx={{ position: 'relative' }}>
                  <PersonOutlineIcon sx={{ position: 'absolute', left: 8, top: 12, color: '#8B5CF6' }} />
                  <TextField
                    fullWidth
                    label="Username"
                    {...register('username')}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    sx={inputStyles}
                  />
                </Box>

                <Box sx={{ position: 'relative' }}>
                  <EmailOutlinedIcon sx={{ position: 'absolute', left: 8, top: 12, color: '#8B5CF6' }} />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={inputStyles}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  {...register('dateOfBirth')}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={altInputStyles}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register('phoneNumber')}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                  placeholder="+1234567890"
                  sx={altInputStyles}
                />

                <Box sx={{ position: 'relative' }}>
                  <LockOutlinedIcon sx={{ position: 'absolute', left: 8, top: 12, color: '#8B5CF6' }} />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={inputStyles}
                  />
                </Box>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(to right, #7C3AED, #DB2777)',
                      }
                    }}
                  >
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: '#8B5CF6',
                      color: '#8B5CF6',
                      '&:hover': {
                        borderColor: '#7C3AED',
                        backgroundColor: 'rgba(139, 92, 246, 0.04)',
                      }
                    }}
                  >
                    Already have an account? Login
                  </Button>
                </motion.div>
              </Stack>
            </form>
          </Box>
        </motion.div>
      </Container>
      
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export const inputStyles = {
  '& .MuiOutlinedInput-root': {
    pl: 4,
    '&:hover fieldset': {
      borderColor: '#8B5CF6',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8B5CF6',
    },
  },
  '& .MuiInputLabel-root': {
    left: 30,
    '&.Mui-focused': {
      color: '#8B5CF6',
      transform: 'scale(0.75) translateY(-0.75em) translateX(-18px)',
    },
  },
};

const altInputStyles = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#8B5CF6',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8B5CF6',
    },
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: '#8B5CF6',
    },
  },
};

export default Signup;
