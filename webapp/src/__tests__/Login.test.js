import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { SessionContext } from '../SessionContext';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Login from '../pages/Login';
import '../localize/i18n';

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Login component', () => {
    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
        mockAxios.onPost('http://localhost:8000/login').reply(200, { avatar: 'bertinIcon.jpg' });
    });

    it('should render login form', () => {
        render(
            <SessionContext.Provider value={{}}>
                <RouterProvider router={createMemoryRouter([{ path: '/', element: <Login /> }])}>
                    <Login />
                </RouterProvider>
            </SessionContext.Provider>
        );

        expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        expect(screen.getByTestId('login')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '¿No tienes una cuenta? Regístrate aquí.' })).toBeInTheDocument();
    });

    it('should log in a user', async () => {
        const createSession = jest.fn();
        const updateAvatar = jest.fn();

        render(
            <SessionContext.Provider value={{ createSession, updateAvatar }}>
                <RouterProvider router={createMemoryRouter([{ path: '/', element: <Login /> }])}>
                    <Login />
                </RouterProvider>
            </SessionContext.Provider>
        );

        fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'testpassword' } });
        fireEvent.click(screen.getByTestId('login'));

        await waitFor(() => {
            expect(createSession).toHaveBeenCalledWith('testuser');
            expect(updateAvatar).toHaveBeenCalledWith('bertinIcon.jpg');
            expect(mockNavigate).toHaveBeenCalledWith('/homepage');
        });
    });

    it('should show error message if log in fails', async () => {
        mockAxios.onPost('http://localhost:8000/login').reply(400, { error: 'The username cannot contain only spaces' });

        render(
            <SessionContext.Provider value={{}}>
                <RouterProvider router={createMemoryRouter([{ path: '/', element: <Login /> }])}>
                    <Login />
                </RouterProvider>
            </SessionContext.Provider>
        );

        fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: '    ' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'testpassword' } });
        fireEvent.click(screen.getByTestId('login'));

        await waitFor(() => {
            expect(screen.getByText('Error: The username cannot contain only spaces')).toBeInTheDocument();
        });
    });
});