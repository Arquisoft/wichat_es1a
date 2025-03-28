import * as React from 'react';
import axios from 'axios';
import {
    Container,
    Box,
    Button,
    CssBaseline,
    Grid,
    Typography,
    CircularProgress,
    Card,
    Select,
    MenuItem,
    IconButton,
    useTheme,
    Paper,
    DialogActions, DialogTitle, DialogContent, DialogContentText, Dialog
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { PlayArrow, Pause } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../SessionContext';
import { useContext } from 'react';
import Confetti from 'react-confetti';
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useTranslation } from 'react-i18next';
import i18n from '../../localize/i18n';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const PictureGame = () => {
    const navigate = useNavigate();
    const SUCCESS_SOUND_ROUTE = "/sounds/success_sound.mp3";
    const FAILURE_SOUND_ROUTE = "/sounds/wrong_sound.mp3";

    //sesion information
    const {username} = useContext(SessionContext);
    const theme = useTheme();

    // Traductions
    const { t } = useTranslation();

    // state initialization
    const [round, setRound] = React.useState(1);
    const [questionData, setQuestionData] = React.useState(null);
    const [buttonStates, setButtonStates] = React.useState([]);
    const [answered, setAnswered] = React.useState(false);
    const [shouldRedirect, setShouldRedirect] = React.useState(false);
    const [totalScore, setTotalScore] = React.useState(0);
    const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = React.useState(0);
    const [incorrectlyAnsweredQuestions, setIncorrectlyAnsweredQuestions] = React.useState(0);
    const [totalTimePlayed, setTotalTimePlayed] = React.useState(0);
    const [timerRunning, setTimerRunning] = React.useState(true); // indicate if the timer is working
    const [showConfetti, setShowConfetti] = React.useState(false); //indicates if the confetti must appear
    const [questionCountdownKey, ] = React.useState(60); //key to update question timer
    const [targetTime, ] = React.useState(60);
    const [questionCountdownRunning, setQuestionCountdownRunning] = React.useState(false); //property to start and stop question timer
    const [userResponses, setUserResponses] = React.useState([]);
    const [language, setCurrentLanguage] = React.useState(i18n.language);

    const [category, setCategory] = React.useState('Geography');
    const [possibleAnswers, setPossibleAnswers] = React.useState([]);
    const [isConfigured, setConfiguration] = React.useState(false);
    const [paused, setPaused] = React.useState(false);
    const [passNewRound, setPassNewRound] = React.useState(false);

    const [hint, setHint] = React.useState(null);
    const [chatSessionId, setChatSessionId] = React.useState(null);
    const [chatHistory, setChatHistory] = React.useState([]);

    const [questionHistorial, setQuestionHistorial] = React.useState(Array(round).fill(null));

    // hook to initiating new rounds if the current number of rounds is less than or equal to 3
    React.useEffect(() => {
        if (totalTimePlayed <= targetTime) {
            startNewRound();
            setQuestionCountdownRunning(true)
        }
        // eslint-disable-next-line
    }, [round]);

    const endGame = () => {
        setTimerRunning(false);
        setShouldRedirect(true);
        setQuestionCountdownRunning(false);
        updateStatistics();
        updateQuestionsRecord();
        // eslint-disable-next-line
    }

    // stablish if the confetti must show or not
    React.useEffect(() => {
        if (correctlyAnsweredQuestions > incorrectlyAnsweredQuestions) {
            setShowConfetti(true);
        } else {
            setShowConfetti(false);
        }
    }, [correctlyAnsweredQuestions, incorrectlyAnsweredQuestions]);

    React.useEffect(() => {
        if (passNewRound && !paused) {
            setRound(prevRound => {
                return prevRound + 1;
            });
            setButtonStates([]);
        }
    }, [paused, passNewRound]);

    const startNewRound = async () => {
        setAnswered(false);
        setPassNewRound(false);
        
        // Resetear la sesión de chat para la nueva imagen
        setChatSessionId(null);
        setChatHistory([]);
        setHint(null);

        // Updates current language
        setCurrentLanguage(i18n.language);
        axios.get(`${apiEndpoint}/questions/random/4`)
            .then(quest => {
                // every new round it gets a new question from db
                setQuestionData(quest.data[0]);
                setButtonStates(new Array(4).fill(null));
                getPossibleOptions(quest.data[0]);

            }).catch(error => {
            console.error("Could not get questions", error);
        });

    };

    // It puts 4 possible answers into an array making sure that the correct answer is not repeated
    const getPossibleOptions = async (question) => {
        var options = [];
        options.push(question.response);
        for (let i = 0; i < 3; i++) {
            let randomNumber;
            do {
                randomNumber = Math.floor(Math.random() * question.options.length);
            } while (question.options[randomNumber] === question.response);
            options.push(question.options[randomNumber]);
        }
        options = shuffleArray(options);
        setPossibleAnswers(options);
    }

    // Shuffles array
    function shuffleArray(array) {
        const random = Math.random();
        const randomFactor = random < 0.5 ? -1 : 1;
        return array.sort(() => randomFactor);
    }

    const updateStatistics = async() => {
        try {
            await axios.put(`${apiEndpoint}/statistics`, {
                username:username,
                the_callenge_earned_money:0,
                the_callenge_correctly_answered_questions:0,
                the_callenge_incorrectly_answered_questions:0,
                the_callenge_total_time_played:0,
                the_callenge_games_played:0,
                wise_men_stack_earned_money:totalScore,
                wise_men_stack_correctly_answered_questions:correctlyAnsweredQuestions,
                wise_men_stack_incorrectly_answered_questions:incorrectlyAnsweredQuestions,
                wise_men_stack_games_played:1,
                warm_question_earned_money: 0,
                warm_question_correctly_answered_questions: 0,
                warm_question_incorrectly_answered_questions: 0,
                warm_question_passed_questions: 0,
                warm_question_games_played: 0,
                discovering_cities_earned_money: 0,
                discovering_cities_correctly_answered_questions: 0,
                discovering_cities_incorrectly_answered_questions: 0,
                discovering_cities_games_played: 0,
                online_earned_money: 0,
                online_correctly_answered_questions: 0,
                online_incorrectly_answered_questions: 0,
                online_total_time_played: 0,
                online_games_played: 0,
            });
        } catch (error) {
            console.error("Error:", error);
        };
    }

    const updateQuestionsRecord = async() => {
        try {
            await axios.put(`${apiEndpoint}/questionsRecord`, {
                questions: userResponses,
                username: username,
                gameMode: "WiseMenStack"
            });
        } catch (error) {
            console.error("Error:", error);
        };
    }

    // this function is called when a user selects a response.
    const selectResponse = async (index, response) => {
        setQuestionCountdownRunning(false);
        setAnswered(true);
        const newButtonStates = [...buttonStates];

        //setQuestionCountdownRunning(false);

        //check answer
        if (response === questionData.response) {
            let options = new Array(questionData.distractors);
            options.push(questionData.response);
            const userResponse = {
                question: questionData.question,
                response: response,
                options,
                correctAnswer: questionData.response
            };
            setUserResponses(prevResponses => [...prevResponses, userResponse]);

            newButtonStates[index] = "success"
            const sucessSound = new Audio(SUCCESS_SOUND_ROUTE);
            sucessSound.volume = 0.40;
            sucessSound.play();
            setCorrectlyAnsweredQuestions(correctlyAnsweredQuestions + 1);
            setTotalScore(totalScore + 20);

            const newQuestionHistorial = [...questionHistorial];
            newQuestionHistorial[round-1] = true;
            setQuestionHistorial(newQuestionHistorial);
        } else {
            const userResponse = {
                question: questionData.question,
                response: response,
                options: questionData.options,
                correctAnswer: questionData.correctAnswer
            };
            setUserResponses(prevResponses => [...prevResponses, userResponse]);
            newButtonStates[index] = "failure";
            const failureSound = new Audio(FAILURE_SOUND_ROUTE);
            failureSound.volume = 0.40;
            failureSound.play();
            for (let i = 0; i < questionData.options.length; i++) {
                if (questionData.options[i] === questionData.correctAnswer) {
                    newButtonStates[i] = "success";
                }
            }
            setIncorrectlyAnsweredQuestions(incorrectlyAnsweredQuestions + 1);

            const newQuestionHistorial = [...questionHistorial];
            newQuestionHistorial[round-1] = false;
            setQuestionHistorial(newQuestionHistorial);
        }

        if (round === 5) {
            endGame();
        }

        setButtonStates(newButtonStates);

        setTimeout(async() => {
            setPassNewRound(true);
            setCurrentLanguage(i18n.language);
        }, 4000);
    };

    const questionHistorialBar = () => {
        return questionHistorial.map((isCorrect, index) => (
            <Card data-testid={`prog_bar${index}`} sx={{ width: `${100 / round}%`, padding:'0.2em', margin:'0 0.1em', backgroundColor: isCorrect === null ? 'gray' : isCorrect ? theme.palette.success.main : theme.palette.error.main }}/>
        ));
    };

    const togglePause = () => {
        setTimerRunning(!timerRunning);
        setPaused(!paused);
    }

    if(!isConfigured) {
        return (
            <Container sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Paper elevation={5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4em', padding: '4em', borderRadius: '4em' }}>
                    <Typography variant="h2" align="center" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', fontSize:'3rem' }}>
                        {t("Game.config.title")}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                            <Typography variant="h4" fontWeight="bold" color="error">{t("Wise_Men.instructions1")}</Typography>
                            <Typography variant="h4" fontWeight="bold" color={theme.palette.success.main} >{t("Wise_Men.instructions2")}</Typography>
                            <Typography variant="h4" fontWeight="bold" color="primary">{t("Wise_Men.instructions3")}</Typography>
                        </Box>

                        {/* Dropdown for selecting category */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                            <Typography data-testid="categories-label" variant='h5' htmlFor="category">
                                {t("Game.config.category")}:
                            </Typography>
                            <Select value={category} onChange={(event) => setCategory(event.target.value)} style={{ minWidth: '120px' }}>
                                <MenuItem value="Animals">{t("Game.categories.animals")}</MenuItem>
                            </Select>
                        </Box>
                    </Box>

                    <Button data-testid="start-button" onClick={() => { setConfiguration(true); startNewRound(); setQuestionHistorial(Array(round).fill(null)); }} variant="contained" size="large"
                            sx={{ fontFamily: 'Arial Black, sans-serif', color: theme.palette.primary.main, backgroundColor: 'transparent', border: `2px solid ${theme.palette.primary.main}`,
                                transition: 'background-color 0.3s ease', '&:hover': { backgroundColor: theme.palette.primary.main, color: 'white' }}}>
                        {t("Game.start")}
                    </Button>
                </Paper>
            </Container>
        );
    }

    // redirect to homepage if game over
    if (shouldRedirect) {
        // Redirect after 5 seconds
        setTimeout(() => {
            navigate('/homepage');
        }, 5000);

        return (
            <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4em', textAlign: 'center', flex: '1'}}>
                <CssBaseline />
                <Typography variant="h2" data-testid="end-game-message" sx={{ color: correctlyAnsweredQuestions > incorrectlyAnsweredQuestions ? theme.palette.success.main : theme.palette.error.main }}>
                    {correctlyAnsweredQuestions > incorrectlyAnsweredQuestions ? t("Game.win_msg") : t("Game.lose_msg") }
                </Typography>
                <Container>
                    <Typography variant="h4">{ t("Game.correct") }: {correctlyAnsweredQuestions}</Typography>
                    <Typography variant="h4">{ t("Game.incorrect") }: {incorrectlyAnsweredQuestions}</Typography>
                    <Typography variant="h4">{ t("Game.money") }: {totalScore}</Typography>
                </Container>
                {showConfetti && <Confetti />}
            </Container>
        );
    }

    async function getHint() {
        try {
            let currentSessionId = chatSessionId;
            
            // Si no hay una sesión de chat existente, crear una nueva
            if (!currentSessionId) {
                // Primero establecer la imagen de referencia
                await fetch("http://localhost:8003/set-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageUrl: questionData.image_url })
                });
                
                // Luego crear una nueva sesión
                const sessionResponse = await fetch("http://localhost:8003/new-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                
                const sessionData = await sessionResponse.json();
                currentSessionId = sessionData.sessionId;
                setChatSessionId(currentSessionId);
            }
            
            // Enviar mensaje al chat
            const chatResponse = await fetch("http://localhost:8003/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    messages: ["¿Puedes darme una pista sobre este animal?"],
                    sessionId: currentSessionId
                })
            });

            const data = await chatResponse.json();
            
            // Guardar historial de chat
            setChatHistory(data.history || []);
            
            // Mostrar la respuesta como pista
            setHint(data.response || "No se recibió una pista.");
        } catch (error) {
            setHint("Error al conectar con el servicio de pistas.");
            console.error("Error al obtener pista:", error);
        }
    }

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center', flex: '1', gap: '2em', margin: '0 auto', padding: '1em 0' }}>
            <CssBaseline />
            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                { false ?
                     // Pausa
                    <IconButton variant="contained" size="large" color="primary" aria-label={ paused ? t("Game.play") : t("Game.pause") }
                        onClick={() => togglePause()} sx={{ height: 100, width: 100, border: `2px solid ${theme.palette.primary.main}` }}
                         data-testid={ paused ? "play" : "pause"} >
                        { paused ? <PlayArrow sx={{ fontSize:75 }} /> : <Pause sx={{ fontSize:75 }} /> }
                    </IconButton>
                                :
                     // Cronómetro
                    <CountdownCircleTimer data-testid="circleTimer" key={questionCountdownKey} isPlaying = {questionCountdownRunning} duration={targetTime} colorsTime={[10, 6, 3, 0]}
                        colors={[theme.palette.success.main, "#F7B801", "#f50707", theme.palette.error.main]} size={100} onComplete={() => endGame()}>
                        {({ remainingTime }) => {
                            return (
                                <Box style={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography fontSize='1.2em' fontWeight='bold'>{remainingTime}</Typography>
                                </Box>
                            );
                        }}
                    </CountdownCircleTimer>
                }
            </Container>

            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em', position: 'relative' }} >
                <Box sx={{ position: "relative", display: "inline-block" }}>
                    <p> ¿Qué animal es este? </p>
                    <img style={{ maxHeight: '30em', maxWidth: '30em' }} src={questionData.image_url} alt="Imagen pregunta" />
                    <Button
                        variant="contained"
                        onClick={() => getHint()}
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "calc(100% + 30px)",
                            transform: "translateY(-50%)",
                            backgroundColor: "yellow",
                            color: "black",
                            borderRadius: "50%",
                            width: "90px",
                            height: "50px",
                            minWidth: "unset",
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            "&:hover": {
                                backgroundColor: "gold",
                            },
                        }}>
                    Pista
                    </Button>
                </Box>

                <Grid container spacing={2} justifyContent="center">
                    {possibleAnswers.map((option, index) => (
                    <Grid item xs={6} key={index} display="flex" justifyContent="center">
                        <Button
                        data-testid={buttonStates[index] === "success" ? `success${index}` : buttonStates[index] === "failure" ? `fail${index}` : `answer${index}`}
                        variant="contained"
                        onClick={() => selectResponse(index, option)}
                        disabled={buttonStates[index] !== null || answered}
                        sx={{
                            height: "3.3em",
                            width: "90%",
                            borderRadius: "10px",
                            "&:disabled": {
                                backgroundColor: buttonStates[index] === "success"
                                    ? theme.palette.success.main
                                    : buttonStates[index] === "failure"
                                    ? theme.palette.error.main
                                    : "gray",
                                color: "white"
                            }
                        }}>
                        {buttonStates[index] === "success" ? <CheckIcon /> : buttonStates[index] === "failure" ? <ClearIcon /> : null}
                        {option}
                        </Button>
                    </Grid>
                    ))}
                </Grid>
            </Container>


            <Container sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop:'2em' }} >
                {questionHistorialBar()}
                { answered || round === 1 ? <Box></Box> : <Card data-testid='prog_bar_final' sx={{ width: `${100 / round}%`, padding:'0.2em', margin:'0 0.1em', backgroundColor: 'gray' }}/> }
            </Container>

            <Dialog
                open={hint !== null}
                onClose={() => setHint(null)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Pista
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {hint}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={async () => {
                            // Solo mostrar el botón si ya tenemos una sesión activa
                            if (chatSessionId) {
                                // Solicitar otra pista manteniendo el contexto actual
                                try {
                                    const chatResponse = await fetch("http://localhost:8003/chat", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ 
                                            messages: ["Dame otra pista diferente, por favor"],
                                            sessionId: chatSessionId
                                        })
                                    });
                                    const data = await chatResponse.json();
                                    setChatHistory(data.history || []);
                                    setHint(data.response || "No se recibió una pista adicional.");
                                } catch (error) {
                                    setHint("Error al conectar con el servicio de pistas.");
                                }
                            }
                        }}
                        color="primary"
                        disabled={!chatSessionId}
                    >
                        Otra pista
                    </Button>
                    <Button onClick={() => setHint(null)} color="primary" autoFocus>
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default PictureGame;
