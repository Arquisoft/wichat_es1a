import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Statistics from '../pages/Statistics';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionContext } from '../SessionContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../localize/i18n';

jest.mock('axios');

HTMLMediaElement.prototype.play = () => {};
Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
    set() {},
});

const mockSession = {
    username: 'testuser'
};

const mockStatisticsData = {
    wise_men_stack_earned_money: 100,
    wise_men_stack_correctly_answered_questions: 10,
    wise_men_stack_incorrectly_answered_questions: 2,
    wise_men_stack_games_played: 3
};

const mockQuestionsRecord = [
    {
        createdAt: '2024-01-01T10:00:00Z',
        questions: [
            {
                question: 'What is 2 + 2?',
                correctAnswer: '4',
                response: '4',
                options: ['3', '4', '5']
            }
        ]
    }
];

const renderStatistics = () =>
    render(
        <I18nextProvider i18n={i18n}>
            <SessionContext.Provider value={mockSession}>
                <MemoryRouter initialEntries={['/statistics/testuser']}>
                    <Routes>
                        <Route path="/statistics/:user" element={<Statistics />} />
                    </Routes>
                </MemoryRouter>
            </SessionContext.Provider>
        </I18nextProvider>
    );

describe('Statistics component', () => {
    beforeEach(() => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/statistics/')) {
                return Promise.resolve({ data: mockStatisticsData });
            }
            if (url.includes('/questionsRecord/')) {
                return Promise.resolve({ data: mockQuestionsRecord });
            }
        });
    });

    it('renderiza correctamente el componente', async () => {
        renderStatistics();

        // Verificamos que se cargue el contenido principal usando heurísticas de contenido
        await waitFor(() => {
            expect(
                screen.getByText((text) => text.toLowerCase().includes('picture game'))
            ).toBeInTheDocument();
        });
    });


    it('permite alternar el registro de preguntas', async () => {
        renderStatistics();

        const toggleButton = await screen.findByRole('button', {
            name: (name) =>
                name.toLowerCase().includes('record') || name.toLowerCase().includes('registro'),
        });

        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(screen.getByText((text) => text.includes('2 + 2'))).toBeInTheDocument();
        });

        fireEvent.click(toggleButton);

        expect(screen.queryByText((text) => text.includes('2 + 2'))).not.toBeInTheDocument();
    });

    it('renderiza el video de fondo', async () => {
        renderStatistics();
        expect(await screen.findByTestId('video')).toBeInTheDocument();
    });

    it('muestra error si la petición falla', async () => {
        axios.get.mockRejectedValueOnce({
            response: { data: { error: 'Something went wrong' } }
        });

        renderStatistics();

        expect(await screen.findByText((text) => text.includes('Something went wrong'))).toBeInTheDocument();
    });
});
