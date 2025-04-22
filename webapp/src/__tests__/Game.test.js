import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Game from '../pages/games/Game';
import { MemoryRouter } from 'react-router-dom';
import { SessionContext } from '../SessionContext';
import axios from 'axios';

// 🧠 Mocks
jest.mock('axios');
jest.mock('react-confetti', () => () => <div data-testid="confetti" />);
window.HTMLMediaElement.prototype.play = () => {}; // mock para sonidos

// 🧪 Activamos timers falsos
beforeAll(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
});

// 🧩 Mocks de datos
const mockQuestion = {
    question: 'What is the capital of France?',
    correctAnswer: 'Paris',
    options: ['Paris', 'London', 'Rome', 'Berlin']
};

const mockSession = {
    username: 'testuser'
};

const renderGame = () =>
    render(
        <SessionContext.Provider value={mockSession}>
            <MemoryRouter>
                <Game />
            </MemoryRouter>
        </SessionContext.Provider>
    );

describe('Game component', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: mockQuestion });
        axios.put.mockResolvedValue({});
    });

    it('muestra el loading al inicio', async () => {
        renderGame();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('muestra la pregunta y las opciones', async () => {
        renderGame();
        const question = await screen.findByTestId('question');
        expect(question).toHaveTextContent(/capital of france/i);

        for (let i = 0; i < mockQuestion.options.length; i++) {
            expect(screen.getByTestId(`answer${i}`)).toBeInTheDocument();
        }
    });

    it('muestra feedback visual al responder correctamente', async () => {
        renderGame();
        const btn = await screen.findByTestId('answer0'); // Paris
        fireEvent.click(btn);
        await waitFor(() => {
            expect(screen.getByTestId('success0')).toBeInTheDocument();
        });
    });

    it('muestra feedback visual al responder incorrectamente', async () => {
        renderGame();
        const btn = await screen.findByTestId('answer1'); // London
        fireEvent.click(btn);
        await waitFor(() => {
            expect(screen.getByTestId('fail1')).toBeInTheDocument();
            expect(screen.getByTestId('success0')).toBeInTheDocument(); // correcta
        });
    });

    it('muestra barra de progreso con tarjetas coloreadas', async () => {
        renderGame();
        const btn = await screen.findByTestId('answer0');
        fireEvent.click(btn);
        jest.advanceTimersByTime(4500);
        await waitFor(() => {
            expect(screen.getByTestId('prog_bar0')).toBeInTheDocument();
        });
    });

    it('finaliza el juego y muestra el mensaje final', async () => {
        renderGame();

        for (let i = 0; i < 3; i++) {
            const btn = await screen.findByTestId('answer0');
            fireEvent.click(btn);
            jest.advanceTimersByTime(4500); // Simula paso de ronda
        }

        // Simula redirección (4s delay en Game.jsx)
        jest.advanceTimersByTime(4000);

        await waitFor(() => {
            expect(screen.getByTestId('end-game-message')).toBeInTheDocument();
        });
    });
});
