import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import NavBar from '../NavBar';
import { SessionContext } from '../SessionContext';
import i18n from 'i18next';

describe('NavBar Component', () => {
  const mockDestroySession = jest.fn();
  const renderNavBar = (isLoggedIn = false, username = '', avatar = '') => {
    return render(
      <MemoryRouter>
        <SessionContext.Provider value={{ isLoggedIn, username, avatar, destroySession: mockDestroySession }}>
          <NavBar />
        </SessionContext.Provider>
      </MemoryRouter>
    );
  };

  test('renders logo', () => {
    renderNavBar();
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  test('renders login button when not logged in', () => {
    renderNavBar(false);
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
  });

  test('renders username and profile picture when logged in', () => {
    renderNavBar(true, 'testuser', '/test-avatar.jpg');
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByAltText('Profile pic')).toHaveAttribute('src', '/test-avatar.jpg');
  });

  test('calls destroySession on logout', () => {
    renderNavBar(true, 'testuser');
    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);
    expect(mockDestroySession).toHaveBeenCalled();
  });

  test('displays navigation links when logged in', () => {
    renderNavBar(true);
    expect(screen.getByText(/NavBar.play/i)).toBeInTheDocument();
    expect(screen.getByText(/NavBar.statistics/i)).toBeInTheDocument();
    expect(screen.getByText(/NavBar.instructions/i)).toBeInTheDocument();
  });

  test('changes language on selection', () => {
    renderNavBar();
    i18n.changeLanguage = jest.fn();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } });
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
  });
});