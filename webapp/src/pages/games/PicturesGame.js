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
  TextField,
  Popover
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { PlayArrow, Pause, ChatBubble, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../SessionContext';
import {useContext, useMemo} from 'react';
import Confetti from 'react-confetti';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { useTranslation } from 'react-i18next';
import i18n from '../../localize/i18n';

import { API_URL, LLM_URL } from '../../env';

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
  const [round, setRound] = React.useState(-1);
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
  const [questionCountdownKey, setQuestionCountdownKey] = React.useState(0);
  const [timerPerQuestion] = React.useState(45); //Tiempo por pregunta en segundos
  const [questionCountdownRunning, setQuestionCountdownRunning] = React.useState(false);
  const [userResponses, setUserResponses] = React.useState([]);
  const [language, setCurrentLanguage] = React.useState(i18n.language);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [category, setCategory] = React.useState('flags');
  const [possibleAnswers, setPossibleAnswers] = React.useState([]);
  const [isConfigured, setConfiguration] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [passNewRound, setPassNewRound] = React.useState(false);
  const [hint, setHint] = React.useState(null);
  const [questionHistorial, setQuestionHistorial] = React.useState(Array(5).fill(null)); // Siempre 5 preguntas
  // Añadimos una animación de transición entre preguntas
  const [fadeTransition, setFadeTransition] = React.useState(false);

  // Estados para el chat persistente
  const [chatMessages, setChatMessages] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');
  // Estados para el chat redimensionable
  const [chatSize, setChatSize] = React.useState({ width: 300, height: 300 });
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeStartPos, setResizeStartPos] = React.useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = React.useState({ width: 0, height: 0 });
  const [chatOpen, setChatOpen] = React.useState(true);

  // Iniciar nueva ronda cuando el round cambie
  React.useEffect(() => {
    if (round > 0 && round <= 5) { // Límite de 5 rondas
      startNewRound();
      setQuestionCountdownRunning(true);
      // Reiniciamos el temporizador para cada pregunta
      setQuestionCountdownKey(prev => prev + 1);
    } else if(round > 5) {
      endGame();
    }
    // eslint-disable-next-line
  }, [round]);

  const questionText = useMemo(() => {
    switch (category) {
      case 'animals': return '¿Que animal es este?';
      case 'cities': return '¿Que país es este?';
      case 'flags': return '¿De dónde es esta bandera?';
    }
  }, [category]);

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
    // Reseteamos los estados
    // 1. Limpiamos el chat
    setChatMessages([]);

    // 2. Reseteamos otros estados
    setAnswered(false);
    setPassNewRound(false);
    setCurrentLanguage(i18n.language);

    console.log('Cargando categoria', category, round);
    setQuestionData(null);

    // 3. Obtenemos la nueva pregunta
    axios.get(`${API_URL}/questions/random/${category}/4?username=${username}`)
      .then(async (quest) => {
        const question = quest.data[0];
        setQuestionData(question);
        setButtonStates(new Array(4).fill(null));
        getPossibleOptions(question);

        // Configuramos la imagen en el LLM y obtenemos el mensaje de bienvenida
        // 4. Configuramos la imagen en el LLM
        if (question.image_url) {
          try {
            const response = await axios.post(`${LLM_URL}/set-image`, {
              imageUrl: question.image_url,
              gameCategory: category
            });

            // Inicializamos el chat con el mensaje de bienvenida
            if (response.data.welcomeMessage) {
              setChatMessages([
                { sender: 'system', text: response.data.welcomeMessage }
              ]);
            } else {
              // Si no hay mensaje de bienvenida, inicializamos chat vacío
              setChatMessages([]);
            }
          } catch (error) {
            console.error("Error al configurar la imagen en el LLM:", error);
            setChatMessages([]); // En caso de error, chat vacío
          }
        }
      })
      .catch(error => {
        console.error("Could not get questions", error);
        setChatMessages([]); // En caso de error, chat vacío
      });
  };

  // Preparar opciones de respuesta
  const getPossibleOptions = async (question) => {
    let options = shuffleArray(question.options);
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
      await axios.put(`${API_URL}/statistics`, {
        username: username,
        wise_men_stack_earned_money: totalScore,
        wise_men_stack_correctly_answered_questions: correctlyAnsweredQuestions,
        wise_men_stack_incorrectly_answered_questions: incorrectlyAnsweredQuestions,
        wise_men_stack_games_played: 1
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateQuestionsRecord = async () => {
    try {
      await axios.put(`${API_URL}/questionsRecord`, {
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

    // Activar efecto de transición
    setFadeTransition(true);

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
      setFadeTransition(false); // Desactivar efecto de transición
      setPassNewRound(true);
      setCurrentLanguage(i18n.language);
    }, 3000);
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
      console.log("Enviando mensaje al LLM con historial completo:", [...chatMessages, userMessage]);
      const response = await axios.post(`${LLM_URL}/chat`, {
        messages: [...chatMessages, userMessage],  // Enviamos todo el historial del chat
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
      await axios.post(`${LLM_URL}/set-image`, {
        imageUrl: questionData.image_url
      });

      const response = await axios.post(`${LLM_URL}/chat`, {
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
              <Select value={category} style={{ minWidth: '120px' }}>
                <MenuItem value="animals" onClick={() => setCategory(('animals'))}>Animales</MenuItem>
                <MenuItem value="cities" onClick={() => setCategory(('cities'))}>Ciudades</MenuItem>
                <MenuItem value="flags" onClick={() => setCategory(('flags'))}>Banderas</MenuItem>
                <MenuItem value="logos" onClick={() => setCategory(('logos'))}>Logos</MenuItem>
                {/* Agrega más categorías si lo deseas */}
              </Select>
            </Box>
          </Box>
          <Button
            data-testid="start-button"
            onClick={() => {
              setConfiguration(true);
              setQuestionHistorial(Array(1).fill(null));
              setRound(1);
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
    <Container maxWidth="xl" sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
      textAlign: 'center',
      flex: '1',
      gap: '2em',
      margin: '0 auto',
      padding: '1em 0',
      // Añadimos fondo con degradado para mejorar apariencia
      background: 'linear-gradient(to bottom, #f5f7fa, #e4e8f0)'
    }}>
      <CssBaseline />

      {/* Contenedor principal usando Grid para mejor organización del espacio */}
      <Grid container spacing={3}>
        {/* Columna izquierda (juego) - ocupa 8/12 en pantallas grandes, 12/12 en pequeñas */}
        <Grid item xs={12} md={chatOpen ? 8 : 12}>
          <Container sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // Transición suave entre preguntas
            opacity: fadeTransition ? 0.7 : 1,
            transition: 'opacity 0.5s ease-in-out'
          }}>
            {answered ?
              // Botón de pausa/continuar
              <IconButton
                variant="contained"
                size="large"
                color="primary"
                aria-label={paused ? t("Game.play") : t("Game.pause")}
                onClick={() => togglePause()}
                sx={{
                  height: 100,
                  width: 100,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
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
                duration={timerPerQuestion}
                colorsTime={[30, 15, 7, 0]}
                colors={[theme.palette.success.main, "#F7B801", "#f50707", theme.palette.error.main]}
                size={120}
                strokeWidth={12}
                trailColor="#eee"
                onComplete={() => selectResponse(-1, "FAILED")}
              >
                {({ remainingTime }) => (
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    animation: remainingTime <= 5 ? 'pulse 1s infinite' : 'none'
                  }}>
                    <Typography fontSize="1.8em" fontWeight="bold">{remainingTime}</Typography>
                    <Typography variant="caption" fontSize="0.8em">segundos</Typography>
                  </Box>
                )}
              </CountdownCircleTimer>
            }

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 2 }}>
            {/* Imagen con texto encima */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                {questionText}
              </Typography>
              <Box
                component="img"
                src={questionData?.image_url ?? '/loading.gif'}
                alt="Imagen de la pregunta"
                sx={{
                  maxHeight: '15em',
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  objectFit: 'contain'
                }}
              />
            </Box>

            {/*Botón para mostrar el chat*/}
            <Button
              variant="contained"
              onClick={() => setChatOpen(prev => !prev)}
              sx={{
              marginBottom: '1em',
              backgroundColor: 'white',
              color: theme.palette.primary.dark,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  color: 'white',
                },
                fontWeight: 'bold',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em'
              }}
            >
            {chatOpen ? 'Ocultar Chat ❌' : 'Abrir Chat 💬'}
            </Button>
          </Box>

            <Grid container spacing={2} justifyContent="center" mt={2}>
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

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', mt: 2 }}>
              {questionHistorialBar()}
              {answered || round === 1 ? <Box></Box> : <Card data-testid="prog_bar_final" sx={{ width: `${100 / round}%`, padding: '0.2em', margin: '0 0.1em', backgroundColor: 'gray' }} />}
            </Box>
          </Container>
        </Grid>

        {/* Columna derecha (chat) - ocupa 4/12 en pantallas grandes, 12/12 en pequeñas */}
        {chatOpen && (
        <Grid item xs={12} md={4}>
          {/* Contenedor de chat integrado */}
          <Paper
            elevation={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: '400px',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            {/* Cabecera del chat */}
            <Box
              sx={{
                backgroundColor: theme.palette.primary.main,
                padding: '0.5em 1em',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="subtitle1" sx={{ color: 'white' }}>
                Chat de Pistas
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={getHint}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Pista
              </Button>
            </Box>

            {/* Área de mensajes */}
            <Box
              sx={{
                flex: 1,
                padding: '1em',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.default
              }}
            >
              {chatMessages.length === 0 && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  color: theme.palette.text.secondary,
                  flexDirection: 'column'
                }}>
                  <ChatBubble sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">
                    Envía un mensaje para pedir ayuda o pistas sobre la imagen
                  </Typography>
                </Box>
              )}
              {chatMessages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    marginBottom: '0.8em',
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: msg.sender === 'user' ? theme.palette.primary.light : theme.palette.grey[300],
                      color: msg.sender === 'user' ? 'white' : 'black',
                      padding: '0.8em',
                      borderRadius: '12px',
                      maxWidth: '80%',
                      wordBreak: 'break-word',
                      boxShadow: 1
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Input para enviar mensajes */}
            <Box sx={{ display: 'flex', padding: '0.8em', borderTop: `1px solid ${theme.palette.divider}` }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Escribe tu mensaje..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
              />
              <Button
                onClick={sendChatMessage}
                variant="contained"
                sx={{ marginLeft: '0.5em' }}
              >
                Enviar
              </Button>
            </Box>
          </Paper>
        </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default PictureGame;
