import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Homepage from '../pages/Homepage';
import '../localize/i18n';

// Hacemos un mock del módulo '@mui/material' y su hook useMediaQuery
jest.mock('@mui/material/useMediaQuery', () => ({
    __esModule: true, // Esto es necesario para mocks de módulos ES6
    default: jest.fn(), // Mock por defecto para todas las llamadas
}));

describe('Homepage', () => {
    afterEach(() => {
        jest.restoreAllMocks(); // Limpiar todos los mocks después de cada prueba
    });

    it('renders video and play button', () => {
        render(<Homepage />);
        expect(screen.getByTestId('video')).toBeInTheDocument();
        expect(screen.getByText("JUGAR")).toBeInTheDocument();
    });

    it('loads game buttons dynamically based on data', async () => {
        render(<Homepage />);
        const buttons = await screen.findAllByRole('button');
        expect(buttons.length).toBe(1); // 5 game buttons + 1 play button
    });

    it('check play button has correct link', async () => {
        render(<Homepage />);
        const playButton = screen.getByText('JUGAR');
        expect(playButton).toHaveAttribute('href', '/pictureGame');
    });

});