import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from '../pages/Profile';
import { SessionContext } from '../SessionContext';
import axios from 'axios';

// Mockeo de axios
jest.mock('axios');

const userMock = {
    username: 'testuser',
    name: 'Test',
    surname: 'User',
    imageUrl: 'test.png',
    createdAt: '2024-01-01T00:00:00Z',
};

const contextMock = {
    username: 'testuser',
    updateAvatar: jest.fn(),
};

describe('Profile component', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: userMock });
    });

    it('muestra los datos del usuario correctamente', async () => {
        render(
            <SessionContext.Provider value={contextMock}>
                <Profile />
            </SessionContext.Provider>
        );

        expect(await screen.findByText('testuser')).toBeInTheDocument();
        expect(screen.getByText(/Test/)).toBeInTheDocument();
        expect(screen.getByAltText(/Profile pic/i)).toHaveAttribute('src', 'test.png');
    });

    it('permite seleccionar un avatar y aplicar cambios', async () => {
        axios.put.mockResolvedValue({});
        render(
            <SessionContext.Provider value={contextMock}>
                <Profile />
            </SessionContext.Provider>
        );

        const hugoButton = await screen.findByTestId('emilio-button');
        fireEvent.click(hugoButton);

        const confirmButton = screen.getByTestId('confirm-button');
        fireEvent.click(confirmButton);

        await waitFor(() =>
            expect(screen.getByText(/Avatar changed successfully/i)).toBeInTheDocument()
        );
        expect(contextMock.updateAvatar).toHaveBeenCalledWith('icons/Emilio.png');
    });

    it('muestra error si no puede cargar el perfil', async () => {
        axios.get.mockRejectedValue(new Error('fail'));
        render(
            <SessionContext.Provider value={contextMock}>
                <Profile />
            </SessionContext.Provider>
        );

        expect(await screen.findByText(/Error fetching user information/)).toBeInTheDocument();
    });
});
