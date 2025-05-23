import React, { useEffect, useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Divider, Snackbar } from '@mui/material';
import { SessionContext } from '../SessionContext';

import { EMILIO, SNOOPY, CHETIS, ALDEA } from '../data/icons';

import { useTranslation } from 'react-i18next';

import { API_URL } from '../env';

const Profile = () => {
    const { t } = useTranslation();

    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [currentSelectedAvatar, setCurrentSelectedAvatar] = useState('defalt_user.jpg');
    const { username, updateAvatar } = useContext(SessionContext);

    const fetchUserInfo = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/profile`, { params: { username: username } });
            setUserInfo(response.data);
        } catch (error) {
            setError('Error fetching user information');
        }
    }, [username]);

    const handleAvatarSelect = (name) => {
        setCurrentSelectedAvatar(name);
        setSelectedAvatar(name);
      };

    const handleAvatarChange = async () => {
        try {
            await axios.put(`${API_URL}/profile/${username}`, { imageUrl: currentSelectedAvatar });
            updateAvatar(selectedAvatar);
            setSnackbarMessage('Avatar changed successfully');
            setOpenSnackbar(true);
            fetchUserInfo();
        } catch (error) {
            setError('Error updating user information');
        }
    }

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    if (error || !userInfo) {
        return (
            <Container sx={{ margin: '0 auto auto' }}>
                <Typography variant="h5" sx={{ textAlign:'center' }}>{error}</Typography>
            </Container>
        )
    }

    return (
        <Container sx={{ margin: '0 auto auto', display:'flex', flexDirection:'column' }}>
            <Typography variant="h2" align="center" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', fontSize:'3rem' }}>{userInfo.username}</Typography>
            <Container sx={{ display:'flex' }}>
                <Container sx={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                    <Typography variant="h4"><b>{t("Profile.name")}</b> {userInfo.name}</Typography>
                    <Typography variant="h4"><b>{t("Profile.surname")}</b> {userInfo.surname}</Typography>
                    <Typography variant="h4"><b>{t("Profile.created_in")}</b> {new Date(userInfo.createdAt).toLocaleDateString()}</Typography>
                </Container>
                <img src={userInfo.imageUrl} alt="Profile pic" style={{ flex: 1, maxWidth:'20%', borderRadius:'50%' }} />
            </Container>

            <Divider style={{ margin:'1em 0'}}/>

            <Typography variant="h5" sx={{ textAlign:'center', fontWeight:'bold'  }}>{t("Profile.choose_your_avatar")}</Typography>
            <Container sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Button sx={{ display:'flex', flexDirection:'column', borderBottom: selectedAvatar === EMILIO ? '2px solid #006699' : 'none' }} onClick={() => handleAvatarSelect(EMILIO)} data-testid="emilio-button">
                    <img src={EMILIO} style={{ flex: 1, maxWidth: '50%', borderRadius:'50%', margin:'1em' }} alt="Icon1" />
                    <Typography sx={{color: '#000000', fontWeight:'bold'  }}>Emilio</Typography>
                </Button>
                <Button sx={{ display:'flex', flexDirection:'column', borderBottom: selectedAvatar === SNOOPY ? '2px solid #006699' : 'none' }} onClick={() => handleAvatarSelect(SNOOPY)} data-testid="snoopy-button">
                    <img src={SNOOPY} style={{ flex: 1, maxWidth: '50%', borderRadius:'50%', margin:'1em' }} alt="Icon2" />
                    <Typography sx={{color: '#000000', fontWeight:'bold'  }}>Snoopy</Typography>
                </Button>
                <Button sx={{ display:'flex', flexDirection:'column', borderBottom: selectedAvatar === CHETIS ? '2px solid #006699' : 'none' }} onClick={() => handleAvatarSelect(CHETIS)} data-testid="chetis-button">
                    <img src={CHETIS} style={{ flex: 1, maxWidth: '50%', borderRadius:'50%', margin:'1em' }} alt="Icon2" />
                    <Typography sx={{color: '#000000', fontWeight:'bold'  }}>Chetis</Typography>
                </Button>
                <Button sx={{ display:'flex', flexDirection:'column', borderBottom: selectedAvatar === ALDEA ? '2px solid #006699' : 'none' }} onClick={() => handleAvatarSelect(ALDEA)} data-testid="aldea-button">
                    <img src={ALDEA} style={{ flex: 1, maxWidth: '50%', borderRadius:'50%', margin:'1em' }} alt="Icon2" />
                    <Typography sx={{color: '#000000', fontWeight:'bold'  }}>Aldea</Typography>
                </Button>
            </Container>
            <Container sx={{ display:'flex', justifyContent:'center', marginTop:'2em' }}>
                    <Button variant="contained" onClick={handleAvatarChange} data-testid="confirm-button">{t("Profile.confirm_changes")}</Button>
            </Container>
            <Snackbar open={openSnackbar} autoHideDuration={4500} onClose={handleCloseSnackbar} message={snackbarMessage} />
            {error && (<Snackbar open={!!error} autoHideDuration={4500} onClose={() => setError('')} message={`Error: ${error}`} />)}
        </Container>
    );
}

export default Profile;
