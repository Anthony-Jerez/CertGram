import React, { useState } from 'react';
import axios from 'axios';
import { Button, CircularProgress, Typography } from '@mui/material';

const UploadPicture = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null); // Reset any previous errors
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Please select a file first!');
      return;
    }

    setUploading(true);
    setError(null); // Reset any previous errors

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send the file to the backend API for upload
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedUrl(response.data.url); // Set the uploaded URL for preview or use
      setUploading(false); // Done uploading
    } catch (uploadError) {
      console.error('Error uploading file:', uploadError);
      setError(uploadError.response?.data?.error || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Upload Profile Picture
      </Typography>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={uploadFile}
        disabled={uploading}
        sx={{ mt: 2 }}
      >
        {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
      </Button>

      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

      {uploadedUrl && (
        <div sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload Successful! View your profile picture:
          </Typography>
          <img src={uploadedUrl} alt="Uploaded Profile" width="200" />
        </div>
      )}
    </div>
  );
};

export default UploadPicture;
