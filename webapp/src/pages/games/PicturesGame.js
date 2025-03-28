import * as React from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Button,
  CssBaseline,
  Grid,
  Typography,
  Card,
  Select,
  MenuItem,
  IconButton,
  useTheme,
  Paper,
  Drawer,
  Divider,
  TextField
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { PlayArrow, Pause } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../SessionContext';
import { useContext } from 'react';
import Confetti from 'react-confetti';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { useTranslation } from 'react-i18next';
import i18n from '../../localize/i18n';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
const llmEndpoint = 'http://localhost:8003';

const PictureGame = () => {
  const navigate = useNavigate();
  const SUCCESS_SOUND_ROUTE = "/sounds/success_sound.mp3";
  const FAILURE_SOUND_ROUTE = "/sounds/wrong_sound.mp3";

  // Sesión y tema
  const { username } = useContext(SessionContext);
  const theme = useTheme();

  // Traducciones
  const { t } = useTranslation();

  // Estados del juego
  const [round, setRound] = React.useState(1);
  const [questionData, setQuestionData] = React.useState(null);
  const [buttonStates, setButtonStates] = React.useState([]);
  const [answered, setAnswered] = React.useState(false);
  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  const [totalScore, setTotalScore] = React.useState(0);
  const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = React.useState(0);
  const [incorrectlyAnsweredQuestions, setIncorrectlyAnsweredQuestions] = React.useState(0);
  const [totalTimePlayed, setTotalTimePlayed] = React.useState(0);
  const [timerRunning, setTimerRunning] = React.useState(true);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [questionCountdownKey] = React.useState(60);
  const [targetTime] = React.useState(60);
  const [questionCountdownRunning, setQuestionCountdownRunning] = React.useState(false);
  const [userResponses, setUserResponses] = React.useState([]);
  const [language, setCurrentLanguage] = React.useState(i18n.language);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [category, setCategory] = React.useState('Animals');
  const [possibleAnswers, setPossibleAnswers] = React.useState([]);
  const [isConfigured, setConfiguration] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [passNewRound, setPassNewRound] = React.useState(false);
  const [hint, setHint] = React.useState(null);
  const [questionHistorial, setQuestionHistorial] = React.useState(Array(round).fill(null));

  // Estados para el chat persistente
  const [chatMessages, setChatMessages] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');

  // Iniciar nueva ronda cuando el round cambie
  React.useEffect(() => {
    if (totalTimePlayed <= targetTime) {
      startNewRound();
      setQuestionCountdownRunning(true);
    }
    // eslint-disable-next-line
  }, [round]);

  const endGame = () => {
    setTimerRunning(false);
    setShouldRedirect(true);
    setQuestionCountdownRunning(false);
    updateStatistics();
    updateQuestionsRecord();
  };

  // Mostrar confetti si se han respondido correctamente más preguntas que incorrectamente
  React.useEffect(() => {
    if (correctlyAnsweredQuestions > incorrectlyAnsweredQuestions) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [correctlyAnsweredQuestions, incorrectlyAnsweredQuestions]);

  React.useEffect(() => {
    if (passNewRound && !paused) {
      setRound(prevRound => prevRound + 1);
      setButtonStates([]);
    }
  }, [paused, passNewRound]);

  const startNewRound = async () => {
    // 1. Limpiamos el chat
    setChatMessages([]);
  
    // 2. Reseteamos otros estados
    setAnswered(false);
    setPassNewRound(false);
    setCurrentLanguage(i18n.language);
  
    // 3. Obtenemos la nueva pregunta
    axios.get(`${apiEndpoint}/questions/random/4`)
      .then(async (quest) => {
        const question = quest.data[0];
        setQuestionData(question);
        setButtonStates(new Array(4).fill(null));
        getPossibleOptions(question);
  
        // 4. Configuramos la imagen en el LLM
        if (question.image_url) {
          try {
            await axios.post(`${llmEndpoint}/set-image`, {
              imageUrl: question.image_url
            });
          } catch (error) {
            console.error("Error al configurar la imagen en el LLM:", error);
          }
        }
      })
      .catch(error => {
        console.error("Could not get questions", error);
      });
  };  

  // Preparar opciones de respuesta
  const getPossibleOptions = async (question) => {
    let options = [];
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
  };

  // Función para mezclar un array
  function shuffleArray(array) {
    const random = Math.random();
    const randomFactor = random < 0.5 ? -1 : 1;
    return array.sort(() => randomFactor);
  }

  const updateStatistics = async () => {
    try {
      await axios.put(`${apiEndpoint}/statistics`, {
        username: username,
        the_callenge_earned_money: 0,
        the_callenge_correctly_answered_questions: 0,
        the_callenge_incorrectly_answered_questions: 0,
        the_callenge_total_time_played: 0,
        the_callenge_games_played: 0,
        wise_men_stack_earned_money: totalScore,
        wise_men_stack_correctly_answered_questions: correctlyAnsweredQuestions,
        wise_men_stack_incorrectly_answered_questions: incorrectlyAnsweredQuestions,
        wise_men_stack_games_played: 1,
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
    }
  };

  const updateQuestionsRecord = async () => {
    try {
      await axios.put(`${apiEndpoint}/questionsRecord`, {
        questions: userResponses,
        username: username,
        gameMode: "WiseMenStack"
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Función al seleccionar una respuesta
  const selectResponse = async (index, response) => {
    setQuestionCountdownRunning(false);
    setAnswered(true);
    const newButtonStates = [...buttonStates];

    if (response === questionData.response) {
      let options = new Array(questionData.distractors);
      options.push(questionData.response);
      const userResponse = {
        question: questionData.question,
        response: response,
        options,
        correctAnswer: questionData.response
      };
      setUserResponses(prev => [...prev, userResponse]);
      newButtonStates[index] = "success";
      const sucessSound = new Audio(SUCCESS_SOUND_ROUTE);
      sucessSound.volume = 0.40;
      sucessSound.play();
      setCorrectlyAnsweredQuestions(correctlyAnsweredQuestions + 1);
      setTotalScore(totalScore + 20);
      const newQuestionHistorial = [...questionHistorial];
      newQuestionHistorial[round - 1] = true;
      setQuestionHistorial(newQuestionHistorial);
    } else {
      const userResponse = {
        question: questionData.question,
        response: response,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer
      };
      setUserResponses(prev => [...prev, userResponse]);
      newButtonStates[index] = "failure";
      const failureSound = new Audio(FAILURE_SOUND_ROUTE);
      failureSound.volume = 0.40;
      failureSound.play();

      // Marcar la correcta
      for (let i = 0; i < questionData.options.length; i++) {
        if (questionData.options[i] === questionData.correctAnswer) {
          newButtonStates[i] = "success";
        }
      }
      setIncorrectlyAnsweredQuestions(incorrectlyAnsweredQuestions + 1);
      const newQuestionHistorial = [...questionHistorial];
      newQuestionHistorial[round - 1] = false;
      setQuestionHistorial(newQuestionHistorial);
    }

    if (round === 5) {
      endGame();
    }

    setButtonStates(newButtonStates);

    setTimeout(() => {
      setPassNewRound(true);
      setCurrentLanguage(i18n.language);
    }, 4000);
  };

  const questionHistorialBar = () => {
    return questionHistorial.map((isCorrect, index) => (
      <Card
        key={index}
        data-testid={`prog_bar${index}`}
        sx={{
          width: `${100 / round}%`,
          padding: '0.2em',
          margin: '0 0.1em',
          backgroundColor: isCorrect === null ? 'gray' : isCorrect ? theme.palette.success.main : theme.palette.error.main
        }}
      />
    ));
  };

  const togglePause = () => {
    setTimerRunning(!timerRunning);
    setPaused(!paused);
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // Función para enviar mensaje de chat
  const sendChatMessage = async () => {
    if (chatInput.trim() === '') return;
    const userMessage = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    try {
      console.log("Enviando mensaje al LLM:", userMessage.text, "Categoría:", category);
      const response = await axios.post(`${llmEndpoint}/chat`, {
        messages: [...chatMessages, userMessage],
        gameCategory: category  // Envía la categoría del juego
      });
      const botReply = response.data.response || "No se recibió respuesta.";
      console.log("Respuesta LLM:", botReply);
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error("Error al conectar con el servidor de LLM:", error.response?.data || error.message);
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Error al obtener respuesta." }]);
    }
  };

  // Función para obtener pista
  const getHint = async () => {
    try {
      console.log("Llamando a /set-image con URL:", questionData.image_url);
      await axios.post(`${llmEndpoint}/set-image`, {
        imageUrl: questionData.image_url
      });

      const response = await axios.post(`${llmEndpoint}/chat`, {
        messages: [{ sender: "user", text: "Dame una pista sobre el objeto en la imagen." }],
        gameCategory: category
      });

      setHint(response.data.response || "No se recibió una pista.");
    } catch (error) {
      setHint("Error al obtener la pista.");
      console.error("Error al conectar con el servidor de LLM:", error.response?.data || error.message);
    }
  };

  if (!isConfigured) {
    return (
      <Container sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Paper elevation={5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4em', padding: '4em', borderRadius: '4em' }}>
          <Typography variant="h2" align="center" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', fontSize: '3rem' }}>
            {t("Game.config.title")}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
              <Typography variant="h4" fontWeight="bold" color="error">{t("Wise_Men.instructions1")}</Typography>
              <Typography variant="h4" fontWeight="bold" color={theme.palette.success.main}>{t("Wise_Men.instructions2")}</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">{t("Wise_Men.instructions3")}</Typography>
            </Box>
            {/* Dropdown para seleccionar categoría */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
              <Typography data-testid="categories-label" variant="h5" htmlFor="category">
                {t("Game.config.category")}:
              </Typography>
              <Select value={category} onChange={(event) => setCategory(event.target.value)} style={{ minWidth: '120px' }}>
                <MenuItem value="Animals">{t("Game.categories.animals")}</MenuItem>
                <MenuItem value="Geography">Geography</MenuItem>
                {/* Agrega más categorías si lo deseas */}
              </Select>
            </Box>
          </Box>
          <Button
            data-testid="start-button"
            onClick={() => {
              setConfiguration(true);
              setQuestionHistorial(Array(round).fill(null));
              startNewRound();
            }}
            variant="contained"
            size="large"
            sx={{
              fontFamily: 'Arial Black, sans-serif',
              color: theme.palette.primary.main,
              backgroundColor: 'transparent',
              border: `2px solid ${theme.palette.primary.main}`,
              transition: 'background-color 0.3s ease',
              '&:hover': { backgroundColor: theme.palette.primary.main, color: 'white' }
            }}>
            {t("Game.start")}
          </Button>
        </Paper>
      </Container>
    );
  }

  // Redirigir a homepage si finalizó el juego
  if (shouldRedirect) {
    setTimeout(() => {
      navigate('/homepage');
    }, 5000);

    return (
      <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4em', textAlign: 'center', flex: '1' }}>
        <CssBaseline />
        <Typography variant="h2" data-testid="end-game-message" sx={{ color: correctlyAnsweredQuestions > incorrectlyAnsweredQuestions ? theme.palette.success.main : theme.palette.error.main }}>
          {correctlyAnsweredQuestions > incorrectlyAnsweredQuestions ? t("Game.win_msg") : t("Game.lose_msg")}
        </Typography>
        <Container>
          <Typography variant="h4">{t("Game.correct")}: {correctlyAnsweredQuestions}</Typography>
          <Typography variant="h4">{t("Game.incorrect")}: {incorrectlyAnsweredQuestions}</Typography>
          <Typography variant="h4">{t("Game.money")}: {totalScore}</Typography>
        </Container>
        {showConfetti && <Confetti />}
      </Container>
    );
  }

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center', flex: '1', gap: '2em', margin: '0 auto', padding: '1em 0' }}>
      <CssBaseline />
      <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {false ?
          // Pausa (no activa en este ejemplo)
          <IconButton
            variant="contained"
            size="large"
            color="primary"
            aria-label={paused ? t("Game.play") : t("Game.pause")}
            onClick={() => togglePause()}
            sx={{ height: 100, width: 100, border: `2px solid ${theme.palette.primary.main}` }}
            data-testid={paused ? "play" : "pause"}
          >
            {paused ? <PlayArrow sx={{ fontSize: 75 }} /> : <Pause sx={{ fontSize: 75 }} />}
          </IconButton>
          :
          // Cronómetro
          <CountdownCircleTimer
            data-testid="circleTimer"
            key={questionCountdownKey}
            isPlaying={questionCountdownRunning}
            duration={targetTime}
            colorsTime={[10, 6, 3, 0]}
            colors={[theme.palette.success.main, "#F7B801", "#f50707", theme.palette.error.main]}
            size={100}
            onComplete={() => endGame()}
          >
            {({ remainingTime }) => (
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Typography fontSize="1.2em" fontWeight="bold">{remainingTime}</Typography>
              </Box>
            )}
          </CountdownCircleTimer>
        }
      </Container>

      <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em', position: 'relative' }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Typography variant="h5" gutterBottom>¿Qué animal es este?</Typography>
          <img style={{ maxHeight: '30em', maxWidth: '30em' }} src={questionData.image_url} alt="Imagen pregunta" />
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
                }}
              >
                {buttonStates[index] === "success" ? <CheckIcon /> : buttonStates[index] === "failure" ? <ClearIcon /> : null}
                {option}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '2em' }}>
        {questionHistorialBar()}
        {answered || round === 1 ? <Box></Box> : <Card data-testid="prog_bar_final" sx={{ width: `${100 / round}%`, padding: '0.2em', margin: '0 0.1em', backgroundColor: 'gray' }} />}
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6">Pista</Typography>
          <Divider sx={{ mb: 2 }} />
          {hint ? <Typography>{hint}</Typography> : <Typography>Cargando pista...</Typography>}
          <Button variant="contained" onClick={getHint} sx={{ mt: 2 }}>Obtener pista</Button>
          <Button variant="outlined" onClick={toggleDrawer(false)} sx={{ mt: 2 }}>Cerrar</Button>
        </Box>
      </Drawer>

      {/* Ventana de chat persistente en la esquina inferior derecha */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '1em',
          right: '1em',
          width: 300,
          height: 350,
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          boxShadow: theme.shadows[5],
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1300,
          overflow: 'hidden'
        }}
      >
        {/* Cabecera del chat */}
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            padding: '0.5em',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}
        >
          <Typography variant="h6" sx={{ color: 'white' }}>Chatbot</Typography>
        </Box>
        {/* Área de mensajes */}
        <Box sx={{ flex: 1, padding: '0.5em', overflowY: 'auto' }}>
          {chatMessages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                marginBottom: '0.5em',
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Box
                sx={{
                  backgroundColor: msg.sender === 'user' ? theme.palette.primary.light : theme.palette.grey[300],
                  color: msg.sender === 'user' ? 'white' : 'black',
                  padding: '0.5em',
                  borderRadius: '8px',
                  maxWidth: '80%'
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
        {/* Input para enviar mensajes */}
        <Box sx={{ display: 'flex', padding: '0.5em', borderTop: '1px solid #ddd' }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Escribe tu mensaje..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendChatMessage();
              }
            }}
          />
          <Button onClick={sendChatMessage} variant="contained" sx={{ marginLeft: '0.5em' }}>
            Enviar
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PictureGame;