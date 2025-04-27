import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../pages/PrivateRoute';

// Componente mock para renderizado
const MockComponent = () => <div data-testid="private-content">Contenido Privado</div>;
const LoginComponent = () => <div data-testid="login-page">Página de Login</div>;

describe('PrivateRoute component', () => {
  afterEach(() => {
    localStorage.clear();
  });

  const renderWithRoutes = () =>
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/private" element={<PrivateRoute element={MockComponent} />} />
          <Route path="/login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );

  it('renderiza el componente privado si existe sessionId', () => {
    localStorage.setItem('sessionId', 'mockSession');
    renderWithRoutes();
    expect(screen.getByTestId('private-content')).toBeInTheDocument();
  });

  it('redirecciona al login si no hay sessionId', () => {
    renderWithRoutes();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});