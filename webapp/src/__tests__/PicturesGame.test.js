import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PictureGame from '../pages/games/PicturesGame';
import { SessionContext } from '../SessionContext';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { act } from '@testing-library/react';

jest.mock('axios');
jest.mock('react-confetti', () => () => <div data-testid="confetti" />);
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
    it('renders correct question text based on initial category (flags)', async () => {
    renderGame();
  
    const startButton = await screen.findByTestId('start-button');
    await act(async () => {
      fireEvent.click(startButton);
    });
  
    await waitFor(() => {
      expect(screen.getByText('¿De dónde es esta bandera?')).toBeInTheDocument();
    });
  });
  it('changes question text when selecting famous people category', async () => {
    renderGame();
    
    // Find the select element and change its value to logos
    const categorySelect = await screen.findByRole('combobox');
    await act(async () => {
      fireEvent.mouseDown(categorySelect);
    });    // Find and click on the logos option
    const logosOption = await screen.findByText('Personas Famosas');
    await act(async () => {
      fireEvent.click(logosOption);
    });
    
    const startButton = await screen.findByTestId('start-button');
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('¿Quién es esta persona famosa?')).toBeInTheDocument();
    });
  });
});