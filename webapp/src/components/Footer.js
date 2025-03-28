import * as React from 'react';
import { AppBar, Toolbar, Typography, Link } from '@mui/material';

const Footer = () => {
    return (
      <AppBar component="footer" position="static" sx={{ backgroundColor: "primary", color: "white", bottom: 0, left: 0, width: '100%', zIndex: 1000}}>
        <Toolbar>
          <Typography sx={{ margin: 'auto' }}>
            <Link href="https://github.com/Arquisoft/wichat_es1a" target="_blank" rel="noopener" color="inherit">© WICHAT-ES1A</Link>
          </Typography>
        </Toolbar>
      </AppBar>
    );
};

export default Footer;
