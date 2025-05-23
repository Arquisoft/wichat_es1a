import React, { useState,useContext } from 'react';
import axios from 'axios';
import { useTheme, Container, Typography, TextField, Button, Snackbar, Box, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { SessionContext } from '../SessionContext';
import { useTranslation } from 'react-i18next';

import { API_URL } from '../env';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const theme = useTheme();

  const navigate = useNavigate();

  const { createSession, updateAvatar } = useContext(SessionContext);
  const { t } = useTranslation();

  const loginUser = async () => {
    try {
      let response = await axios.post(`${API_URL}/login`, { username, password });
      updateAvatar(response.data.avatar);
      setOpenSnackbar(true);
      createSession(username);
      navigate('/homepage');
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex:'1', marginTop: '2em', marginBottom: '2em'}}>
      <Box sx={{margin: '2em'}}>
        <div>
          <Typography variant="h2" align="center" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', fontSize:'3rem' }}>
            { t("Login.title") }
          </Typography>
          <TextField
            margin="normal"
            fullWidth
            label={ t("Login.username") }
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label={ t("Login.password") }
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Divider style={{ marginTop:'3%'}}/>
          <Button variant="contained" onClick={loginUser} style={{ width: '100%', marginTop: '5%' }}
            sx={{
              fontFamily: 'Arial Black, sans-serif',
              color: theme.palette.primary.main,
              backgroundColor: 'transparent',
              border: `2px solid ${theme.palette.primary.main}`,
              transition: 'background-color 0.3s ease',

              '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
              }
          }}
            data-testid="login"
          >
          { t("Login.button") }
          </Button>
          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="Login successful" />
          {error && (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
          )}
          <Container style={{textAlign: 'center', marginTop:'15%'}}>
            <Link name="gotoregister" component="button" variant="body2" to="/register">
            { t("Login.register_link") }
            </Link>
          </Container>
        </div>
      </Box>
    </Container>
  );
};

export default Login;
