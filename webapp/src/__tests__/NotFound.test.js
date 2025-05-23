import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../pages/NotFound';
import { MemoryRouter } from 'react-router-dom';


jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('NotFound component', () => {
  it('muestra el mensaje de título', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('NotFound.title')).toBeInTheDocument();
  });

  it('muestra el botón para volver al inicio', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'NotFound.button_msg' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'NotFound.button_msg' })).toHaveAttribute('href', '/');
  });

  it('renderiza el fondo animado correctamente', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    const container = screen.getByRole('link', { name: 'NotFound.button_msg' }).previousSibling;
    expect(container).toHaveStyle('background-image: url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)');
  });
});