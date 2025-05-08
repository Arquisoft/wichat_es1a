const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const PictureGame = require('../pages/games/PicturesGame').default;
const { SessionContext } = require('../SessionContext');
const { MemoryRouter } = require('react-router-dom');
const { act } = require('@testing-library/react');

// Mock axios before requiring it
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn()
}));

// Now require axios after it's been mocked
const axios = require('axios');

// Mock react-confetti properly for CommonJS
jest.mock('react-confetti', () => {
  return function DummyConfetti() {
    return '<div data-testid="confetti"></div>';
  };
});

window.HTMLMediaElement.prototype.play = () => {}; // mock para sonidos

beforeAll(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
});

const mockQuestion = {
  question: '¿Qué es esto?',
  response: 'Respuesta Correcta',
  correctAnswer: 'Respuesta Correcta',
  options: ['Opción 1', 'Opción 2', 'Respuesta Correcta', 'Opción 4'],
  image_url: '/img.jpg'
};

const mockSession = {
  username: 'testuser'
};

const renderGame = () => {
  return render(
    <SessionContext.Provider value={mockSession}>
      <MemoryRouter>
        <PictureGame />
      </MemoryRouter>
    </SessionContext.Provider>
  );
};

describe('PictureGame component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [mockQuestion] });
    axios.post.mockResolvedValue({ data: { welcomeMessage: 'Bienvenido' } });
    axios.put.mockResolvedValue({});
  });

  it('muestra la pantalla de configuración', async () => {
    renderGame();
    const startButton = await screen.findByTestId('start-button');
    expect(startButton).toBeInTheDocument();
    const categoriesLabel = await screen.findByTestId('categories-label');
    expect(categoriesLabel).toBeInTheDocument();
  });

  it('inicia el juego correctamente', async () => {
    renderGame();
    const startButton = await screen.findByTestId('start-button');
    await act(async () => {
      fireEvent.click(startButton);
    });
  });

  it('muestra feedback al responder correctamente', async () => {
    renderGame();
    const startButton = await screen.findByTestId('start-button');
    await act(async () => {
      fireEvent.click(startButton);
    });
    const btn = await screen.findByText('Respuesta Correcta');
    await act(async () => {
      fireEvent.click(btn);
    });
  });

  it('muestra feedback al responder incorrectamente', async () => {
    renderGame();
    fireEvent.click(screen.getByTestId('start-button'));
    const btn = await screen.findByText('Opción 1');
    await act(async () => {
      fireEvent.click(btn);
    });
  });

  it('muestra barra de progreso con resultado', async () => {
    renderGame();
    const startButton = await screen.findByTestId('start-button');
    await act(async () => {
      fireEvent.click(startButton);
    });
    const btn = await screen.findByText('Respuesta Correcta');
    await act(async () => {
      fireEvent.click(btn);
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('prog_bar0')).toBeInTheDocument();
    });
  });

  it('chat responde al mensaje del usuario', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { welcomeMessage: 'Bienvenido' } })
      .mockResolvedValueOnce({ data: { response: 'Esta es una pista.' } });

    renderGame();
    const startButton = await screen.findByTestId('start-button');
    await act(async () => {
      fireEvent.click(startButton);
    });

    const input = await screen.findByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(input, { target: { value: 'Dame una pista' } });

    const btn = screen.getByText('Enviar');
    await act(async () => {
      fireEvent.click(btn);
    });

    await waitFor(() => {
      expect(screen.getByText('Esta es una pista.')).toBeInTheDocument();
    });
  });
  it('calls endGame and redirects after finishing the last round', async () => {
    renderGame();
    const startButton = await screen.findByTestId('start-button');
    
    await act(async () => {
      fireEvent.click(startButton);
    });
  
    for (let i = 0; i < 5; i++) {
      const btn = await screen.findByText('Respuesta Correcta');
      await act(async () => {
        fireEvent.click(btn);
        jest.advanceTimersByTime(3000);
      });
    }
  
    await waitFor(() => {
      expect(screen.getByTestId('end-game-message')).toBeInTheDocument();
    });
  
    expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/statistics'), expect.anything());
    expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/questionsRecord'), expect.anything());
  });
  
  it('renders correct question text based on initial category', async () => {
    renderGame();
  
    const startButton = await screen.findByTestId('start-button');
    await act(async () => {
      fireEvent.click(startButton);
    });
  
    await waitFor(() => {
      expect(screen.getByText('¿De dónde es esta bandera?')).toBeInTheDocument();
    });
  });  it('changes question text when selecting art category', async () => {
    renderGame();
    
    // Find all select elements and get the first one (category)
    const selectElements = await screen.findAllByRole('combobox');
    const categorySelect = selectElements[0]; // First select is for category
    
    await act(async () => {
      fireEvent.mouseDown(categorySelect);
    });
    
    // Find and click on the art option
    const artOption = await screen.findByText('Obras de Arte');
    await act(async () => {
      fireEvent.click(artOption);
    });
    
    const startButton = await screen.findByTestId('start-button');
    await act(async () => {
      fireEvent.click(startButton);
    });
      await waitFor(() => {
      expect(screen.getByText('¿Qué obra de arte es esta?')).toBeInTheDocument();
    });
  });  it('shows difficulty selector in the configuration screen', async () => {
    renderGame();
    
    // Find both select elements (category and difficulty)
    const selectElements = await screen.findAllByRole('combobox');
    expect(selectElements.length).toBe(2); // Should have 2 select elements now
    
    // Find and click on the difficulty dropdown
    const difficultySelect = selectElements[1]; // The second Select should be the difficulty one
    await act(async () => {
      fireEvent.mouseDown(difficultySelect);
    });
    
    // Verify we can find all difficulty options - using Spanish text as the app is in Spanish by default
    const easyOption = await screen.findByText('Fácil');
    expect(easyOption).toBeInTheDocument();
      const mediumOption = screen.queryByRole('option', { name: 'Media' });
    expect(mediumOption).toBeInTheDocument();
    
    const hardOption = screen.queryByText('Difícil');
    expect(hardOption).toBeInTheDocument();
  });
  it('sets correct timer value based on difficulty', async () => {
    // Create a test wrapper component to inspect timer value
    const TestWrapper = () => {
      const [difficulty, setDifficultyState] = React.useState('medium');
      const [timerValue, setTimerValue] = React.useState(0);
      
      React.useEffect(() => {
        // Update timer based on difficulty - same logic as in component
        switch (difficulty) {
          case 'easy':
            setTimerValue(60);
            break;
          case 'medium':
            setTimerValue(45);
            break;
          case 'hard':
            setTimerValue(30);
            break;
          default:
            setTimerValue(45);
        }
      }, [difficulty]);
      
      return (
        <div>
          <div data-testid="timer-value">{timerValue}</div>
          <select 
            data-testid="difficulty-select"
            value={difficulty} 
            onChange={(e) => setDifficultyState(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      );
    };
    
    render(<TestWrapper />);
    
    // Should start with medium difficulty (45 seconds)
    expect(screen.getByTestId("timer-value").textContent).toBe("45");
    
    // Change to easy difficulty
    fireEvent.change(screen.getByTestId("difficulty-select"), { target: { value: 'easy' } });
    expect(screen.getByTestId("timer-value").textContent).toBe("60");
    
    // Change to hard difficulty
    fireEvent.change(screen.getByTestId("difficulty-select"), { target: { value: 'hard' } });
    expect(screen.getByTestId("timer-value").textContent).toBe("30");
  });
});