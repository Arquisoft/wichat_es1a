import React from 'react';
import Register from './pages/Register';
import Instructions from './pages/Instructions';
import Login from './pages/Login';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Homepage from './pages/Homepage';
import Game from './pages/games/Game';
import Statistics from './pages/Statistics';
// import Ranking from './pages/Ranking'
import Profile from './pages/Profile'
import {Route, Routes} from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import PrivateRoute from './pages/PrivateRoute';
import NotFound from './pages/NotFound';
import PictureGame from "./pages/games/PicturesGame";

const theme = createTheme({
  palette: {
    mode: 'light',
    // Azul
    primary: {
      main: '#006699',
    },
    secondary: {
      main: '#FFFFFF',
    },
    success: {
      main: '#339966',
    },
    // Rojo
    error: {
      main: '#990000',
    },
  },
});

function App() {

  React.useEffect(() => {
    document.title = "WIChat";
  }, []);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <ThemeProvider theme={theme}>
        <NavBar/>
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/register" element={<Register />}/>
            <Route path="/instructions" element={<PrivateRoute element={Instructions}/>} />
            <Route path="/homepage" element={<PrivateRoute element={Homepage}/>}/>
            <Route path="/pictureGame" element={<PrivateRoute element={PictureGame}/>}/>
            <Route path="/game" element={<PrivateRoute element={Game} />} />
            <Route path="/statistics/:user" element={<PrivateRoute element={Statistics }/>}/>
            <Route path="/profile" element={<PrivateRoute element={Profile}/>}/>
            <Route path="*" element={<NotFound />} />
          </Routes>
        <Footer/>
      </ThemeProvider>
    </Box>
  );
}

export default App;
