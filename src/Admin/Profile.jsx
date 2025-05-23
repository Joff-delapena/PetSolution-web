import React, { useState } from 'react';
import { Avatar, TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const Profile = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [name, setName] = useState('Jofferson Delapena');
  const [email, setEmail] = useState('jofferson@example.com');
  const [bio, setBio] = useState('Web Developer based in USTP.');
  const [avatar, setAvatar] = useState('/path/to/avatar.jpg'); // Default avatar
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Handle save logic here (e.g., upload changes to a server or database)
    alert('Profile updated!');
    setIsEditing(false); // Disable editing after save
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Here you can add logic to upload the file to your server or storage service
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result); // Update the avatar preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    navigate(-1); // Goes back to the previous page
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleBack}
        sx={{ marginBottom: 3 }}
      >
        Back
      </Button>

      <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
        <Avatar
          alt="User Avatar"
          src={avatar}
          sx={{ width: 100, height: 100, margin: 'auto' }}
        />
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="avatar-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="avatar-upload">
          <Button variant="outlined" component="span" sx={{ marginTop: 2 }}>
            Change Profile
          </Button>
        </label>
        <Typography variant="h5" sx={{ marginTop: 2 }}>
          {isEditing ? (
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            name
          )}
        </Typography>
      </Box>

      {isEditing ? (
        <>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Bio"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </>
      ) : (
        <>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            <strong>Email:</strong> {email}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            <strong>Bio:</strong> {bio}
          </Typography>
        </>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ marginTop: 2 }}
        onClick={isEditing ? handleSave : () => setIsEditing(true)}
      >
        {isEditing ? 'Save Changes' : 'Edit Profile'}
      </Button>
    </Box>
  );
};

export default Profile;
