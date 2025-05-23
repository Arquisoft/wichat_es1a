import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
    Container, Typography, Box, Table, TableBody, TableCell,
    TableContainer, TableRow, Button, useTheme, Grid
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { SessionContext } from '../SessionContext';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../env';

const Statistics = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [error, setError] = useState('');
    const [userStatics, setUserStatics] = useState([]);
    const [selectedMode, setSelectedMode] = useState('PictureGame');
    const [questionsRecord, setQuestionsRecord] = useState([]);
    const [showQuestionsRecord, setShowQuestionsRecord] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { username } = useContext(SessionContext);
    const { user } = useParams();

    useEffect(() => {
        const fetchUserStatics = async () => {
            try {
                const response = await axios.get(`${API_URL}/statistics/${user}`, { params: { loggedUser: username } });
                setUserStatics(response.data);
            } catch (error) {
                setError(error.response.data.error);
            }
        };
        fetchUserStatics();
    }, [username, user]);

    useEffect(() => {
        const fetchQuestionsRecord = async () => {
            try {
                const response = await axios.get(`${API_URL}/questionsRecord/${user}/WiseMenStack`);
                setQuestionsRecord(response.data);
            } catch (error) {
                console.error('Error fetching questions record:', error);
            }
        };
        fetchQuestionsRecord();
    }, [user, selectedMode]);

    const flattenedQuestions = questionsRecord.flatMap((record) =>
        record.questions.map((q) => ({
            ...q,
            createdAt: record.createdAt
        }))
    );

    const totalPages = Math.ceil(flattenedQuestions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = flattenedQuestions.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    const renderStatistics = () => {
        const formatStats = (param) => (param === null || param === undefined ? '0' : param);
        switch (selectedMode) {
            case 'WiseMenStack':
                return (
                    <TableContainer>
                        <Table sx={{ minWidth: 360, backgroundColor: 'rgba(84,95,95,0.3)', borderRadius: '10px' }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{t("Statistics.table.money")}:</TableCell>
                                    <TableCell>{formatStats(userStatics.wise_men_stack_earned_money)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{t("Statistics.table.questions_corr")}:</TableCell>
                                    <TableCell>{formatStats(userStatics.wise_men_stack_correctly_answered_questions)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{t("Statistics.table.questions_incorr")}:</TableCell>
                                    <TableCell>{formatStats(userStatics.wise_men_stack_incorrectly_answered_questions)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{t("Statistics.table.played_games")}:</TableCell>
                                    <TableCell>{formatStats(userStatics.wise_men_stack_games_played)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                );
            default:
                return null;
        }
    };

    const formatCreatedAt = (createdAt) => {
        const date = new Date(createdAt);
        return date.toLocaleString('en-US', {
            timeZone: 'Europe/Madrid',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const renderQuestions = () => {
        if (!showQuestionsRecord) return null;
        return (
            <Box>
                <Grid container spacing={2}>
                    {currentItems.map((question, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box sx={{ bgcolor: '#f0f0f0', borderRadius: '20px', padding: '1em' }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    {t("Statistics.game")} {formatCreatedAt(question.createdAt)}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {question.correctAnswer === question.response
                                        ? <CheckIcon style={{ color: theme.palette.success.main, fontSize: '1.2rem' }} />
                                        : <ClearIcon style={{ color: theme.palette.error.main, fontSize: '1.2rem' }} />}
                                    {question.question}
                                </Typography>
                                {question.options.map((option, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            bgcolor:
                                                option === question.correctAnswer
                                                    ? theme.palette.success.main
                                                    : option === question.response
                                                        ? theme.palette.error.main
                                                        : '#ffffff',
                                            color:
                                                option === question.correctAnswer || option === question.response
                                                    ? '#ffffff'
                                                    : 'inherit',
                                            borderRadius: '20px',
                                            padding: '2%',
                                            border: '1px solid #ccc',
                                            marginTop: '2%'
                                        }}
                                    >
                                        {option === question.correctAnswer ? <CheckIcon /> : option === question.response ? <ClearIcon /> : null}
                                        {option}
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ marginTop: '2%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button onClick={handlePrevPage} disabled={currentPage === 1} style={{ fontSize: '1rem' }}>&lt;</button>
                    <p style={{ margin: '0 4%', fontSize: '1rem' }}>{currentPage} / {totalPages || 1}</p>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} style={{ fontSize: '1rem' }}>&gt;</button>
                </Box>
            </Box>
        );
    };

    const videoRef = React.useRef(null);
    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = 0.85;
    }, []);

    return (
        <Container sx={{ margin: '0 auto auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <video data-testid="video" ref={videoRef} autoPlay muted loop style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100%",
                height: "100%",
                transform: "translate(-50%, -50%)",
                objectFit: "cover",
                zIndex: '-1',
                userSelect: 'none',
                pointerEvents: 'none'
            }}>
                <source src="../home/Background-White.webm" type="video/mp4" />
            </video>
            <Typography variant="h2" align="center" fontWeight="bold" gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', fontSize: '3rem' }}>
                {t("Statistics.title")}
            </Typography>
            {error ? (
                <Container sx={{ margin: '0 auto auto' }}>
                    <Typography variant="h5" sx={{ textAlign: 'center' }}>{error}</Typography>
                </Container>
            ) : (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '1em', flexWrap: 'wrap' }}>
                        <Button
                            onClick={() => {
                                if (selectedMode === 'WiseMenStack') {
                                    setSelectedMode(null);
                                } else {
                                    setSelectedMode('WiseMenStack');
                                }
                            }}
                            variant="contained"
                            sx={{
                                marginBottom: isSmallScreen ? '0.5em' : '0',
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.secondary.main,
                                borderColor: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.secondary.main,
                                    color: theme.palette.primary.main,
                                    borderColor: theme.palette.primary.main
                                }
                            }}
                        >
                            Pictures Game
                        </Button>
                    </Box>
                    {renderStatistics()}
                    <Box sx={{ display: 'flex', justifyContent: 'center', margin: '1em 0' }}>
                        <Button
                            onClick={() => setShowQuestionsRecord(!showQuestionsRecord)}
                            variant="contained"
                            sx={{
                                marginBottom: '0.5em',
                                marginTop: '0.5em',
                                backgroundColor: theme.palette.success.main,
                                color: theme.palette.secondary.main,
                                borderColor: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.secondary.main,
                                    color: theme.palette.primary.main,
                                    borderColor: theme.palette.primary.main
                                }
                            }}
                        >
                            {showQuestionsRecord ? t("Statistics.button.hide_record") : t("Statistics.button.show_record")}
                        </Button>
                    </Box>
                    {renderQuestions()}
                </Box>
            )}
        </Container>
    );
};

export default Statistics;
