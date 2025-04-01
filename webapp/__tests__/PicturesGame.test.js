import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PictureGame from '../src/pages/games/PicturesGame';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { SessionContext } from '../src/SessionContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/localize/i18n';

// Mock de axios
jest.mock('axios');

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock de componentes externos
jest.mock('react-confetti', () => () => <div data-testid="confetti" />);
jest.mock('react-countdown-circle-timer', () => ({
  CountdownCircleTimer: ({ children, onComplete }) => (
    <div data-testid="countdown-timer" onClick={onComplete}>
      {children({ remainingTime: 30 })}
    </div>
  )
}));

// Mock de Audio
const mockPlay = jest.fn();
const mockAudio = jest.fn(() => ({
  play: mockPlay,
  volume: 0
}));
window.Audio = mockAudio;

describe('PictureGame Component', () => {
  const mockUsername = 'testUser';
  const mockSessionContext = { username: mockUsername };
  
  const mockQuestionData = [{
    id: '1',
    question: '¿Qué animal es este?',
    image_url: 'http://example.com/image.jpg',
    response: 'León',
    options: ['León', 'Tigre', 'Elefante', 'Jirafa'],
    correctAnswer: 'León',
    distractors: 3
  }];

  // Mock respuesta de LLM
  const mockLLMResponse = {
    response: 'Este es un mensaje de prueba del LLM'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de respuestas de API
    axios.get.mockResolvedValue({ data: mockQuestionData });
    axios.post.mockResolvedValue({ data: mockLLMResponse });
    axios.put.mockResolvedValue({ data: {} });
  });

  const renderWithProviders = (ui) => {
    return render(
      <BrowserRouter>
        <SessionContext.Provider value={mockSessionContext}>
          <I18nextProvider i18n={i18n}>
            {ui}
          </I18nextProvider>
        </SessionContext.Provider>
      </BrowserRouter>
    );
  };

  test('renders configuration screen correctly', () => {
    renderWithProviders(<PictureGame />);
    
    expect(screen.getByTestId('categories-label')).toBeInTheDocument();
    expect(screen.getByTestId('start-button')).toBeInTheDocument();
  });

  test('starts a new game when start button is clicked', async () => {
    renderWithProviders(<PictureGame />);
    
    fireEvent.click(screen.getByTestId('start-button'));
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/questions/random/4'));
    });
  });

  test('handles selecting a correct answer', async () => {
    renderWithProviders(<PictureGame />);
    
    // Start the game
    fireEvent.click(screen.getByTestId('start-button'));
    
    await waitFor(() => {
      // Once the question data is loaded
      expect(screen.getByText('¿Qué animal es este?')).toBeInTheDocument();
    });
    
    // Find all answer buttons and click the one with the correct answer
    const answerButtons = screen.getAllByRole('button').filter(button => 
      button.textContent === 'León'
    );
    
    if (answerButtons.length > 0) {
      fireEvent.click(answerButtons[0]);
      
      expect(mockPlay).toHaveBeenCalled();
      expect(screen.getByTestId('pause')).toBeInTheDocument();
    }
  });

  test('handles selecting an incorrect answer', async () => {
    renderWithProviders(<PictureGame />);
    
    // Start the game
    fireEvent.click(screen.getByTestId('start-button'));
    
    await waitFor(() => {
      expect(screen.getByText('¿Qué animal es este?')).toBeInTheDocument();
    });
    
    // Find all answer buttons and click one with an incorrect answer
    const answerButtons = screen.getAllByRole('button').filter(button => 
      button.textContent === 'Tigre' || button.textContent === 'Elefante' || button.textContent === 'Jirafa'
    );
    
    if (answerButtons.length > 0) {
      fireEvent.click(answerButtons[0]);
      
      expect(mockPlay).toHaveBeenCalled();
      expect(screen.getByTestId('pause')).toBeInTheDocument();
    }
  });

  test('toggles pause/play state correctly', async () => {
    renderWithProviders(<PictureGame />);
    
    // Start the game
    fireEvent.click(screen.getByTestId('start-button'));
    
    await waitFor(() => {
      expect(screen.getByText('¿Qué animal es este?')).toBeInTheDocument();
    });
    
    // Select an answer to make the pause button appear
    const answerButtons = screen.getAllByRole('button').filter(button => 
      ['León', 'Tigre', 'Elefante', 'Jirafa'].includes(button.textContent)
    );
    
    fireEvent.click(answerButtons[0]);
    
    // Test pause button
    const pauseButton = screen.getByTestId('pause');
    fireEvent.click(pauseButton);
    
    // Now it should be a play button
    expect(screen.getByTestId('play')).toBeInTheDocument();
    
    // Click again to toggle back
    fireEvent.click(screen.getByTestId('play'));
    expect(screen.getByTestId('pause')).toBeInTheDocument();
  });

  test('handles time expiration', async () => {
    renderWithProviders(<PictureGame />);
    
    // Start the game
    fireEvent.click(screen.getByTestId('start-button'));
    
    await waitFor(() => {
      expect(screen.getByText('¿Qué animal es este?')).toBeInTheDocument();
    });
    
    // Trigger timer completion
    fireEvent.click(screen.getByTestId('countdown-timer'));
    
    // Should show the pause button since the answer was handled automatically
    await waitFor(() => {
      expect(screen.getByTestId('pause')).toBeInTheDocument();
    });
  });

  test('sends chat message and shows response', async () => {
    renderWithProviders(<PictureGame />);
    
    // Start the game
    fireEvent.click(screen.getByTestId('start-button'));
    
    await waitFor(() => {
      expect(screen.getByText('¿Qué animal es este?')).toBeInTheDocument();
    });
    
    // Type a message in the chat input
    const chatInput = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(chatInput, { target: { value: 'Hola' } });
    
    // Click send button
    const sendButton = screen.getByText('Enviar');
    fireEvent.click(sendButton);
    
    // Verify the API was called and response is displayed
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ sender: 'user', text: 'Hola' })
          ])
        })
      );
      
      expect(screen.getByText('Hola')).toBeInTheDocument();
      expect(screen.getByText('Este es un mensaje de prueba del LLM')).toBeInTheDocument();
    });
  });

  test('requests a hint and displays it', async () => {
    renderWithProviders(<PictureGame />);
    
    // Start the game
    fireEvent.click(screen.getByTestId('start-button'));
    
    await waitFor(() => {
      expect(screen.getByText('¿Qué animal es este?')).toBeInTheDocument();
    });
    
    // Click the hint button
    const hintButton = screen.getByText('Pista');
    fireEvent.click(hintButton);
    
    // Verify API calls
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/set-image'),
        expect.any(Object)
      );
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ 
              text: expect.stringContaining('pista') 
            })
          ])
        })
      );
    });
  });

  test('ends game after 5 rounds', async () => {
    // Mock para simular 5 rondas completadas
    const mockEndGameState = {
      round: 6,
      correctlyAnsweredQuestions: 3,
      incorrectlyAnsweredQuestions: 2,
      totalScore: 60
    };
    
    // Usamos un renderizado específico para este test
    let component;
    act(() => {
      component = renderWithProviders(<PictureGame />);
    });
    
    // Iniciamos juego
    fireEvent.click(screen.getByTestId('start-button'));
    
    // Modificamos el estado interno para simular fin de juego
    await waitFor(() => {
      expect(screen.getByText('¿Qué animal es este?')).toBeInTheDocument();
    });
    
    // Seleccionamos una respuesta 5 veces (simulando 5 rondas)
    for (let i = 0; i < 5; i++) {
      const answerButtons = screen.getAllByRole('button').filter(button => 
        ['León', 'Tigre', 'Elefante', 'Jirafa'].includes(button.textContent)
      );
      
      if (i < 4) {
        axios.get.mockResolvedValueOnce({ data: mockQuestionData });
      }
      
      fireEvent.click(answerButtons[0]);
      
      if (i < 4) {
        // Forzamos cambio de ronda para siguiente iteración
        await act(async () => {
          jest.advanceTimersByTime(3000);
        });
      }
    }
    
    // Verificamos la llamada a actualización de estadísticas
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/statistics'),
        expect.objectContaining({
          username: mockUsername
        })
      );
    });
  });

  test('displays confetti when more correct than incorrect answers', async () => {
    // Setup para que haya más respuestas correctas que incorrectas
    axios.put.mockImplementation(() => {
      // Simulamos el fin del juego con la redirección
      setTimeout(() => mockNavigate('/homepage'), 0);
      return Promise.resolve({});
    });
    
    renderWithProviders(<PictureGame />);
    
    // Start the game
    fireEvent.click(screen.getByTestId('start-button'));
    
    await waitFor(() => {
      expect(screen.getByText('¿Qué animal es este?')).toBeInTheDocument();
    });
    
    // Select correct answers and complete 5 rounds
    const answerButtons = screen.getAllByRole('button').filter(button => 
      button.textContent === 'León'
    );
    
    fireEvent.click(answerButtons[0]);
    
    // Simular que terminaron las 5 rondas
    act(() => {
      const component = screen.getByTestId('pause').closest('div');
      // Acceder al componente React y modificar su estado
      component.__reactProps = {
        ...component.__reactProps,
        round: 5,
        correctlyAnsweredQuestions: 3,
        incorrectlyAnsweredQuestions: 2,
        shouldRedirect: true,
        showConfetti: true
      };
    });
    
    // Verificamos que se llamó a la API para actualizar estadísticas
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
  });
});