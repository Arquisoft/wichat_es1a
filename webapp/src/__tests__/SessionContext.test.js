import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SessionContext, SessionProvider } from '../SessionContext';

// Mockear localStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn();
  Storage.prototype.setItem = jest.fn();
  Storage.prototype.removeItem = jest.fn();
});

describe('SessionProvider', () => {
  it('initializes with default values if no localStorage is available', () => {
    render(
      <SessionProvider>
        <SessionContext.Consumer>
          {(value) => (
            <>
              <div>isLoggedIn: {value.isLoggedIn.toString()}</div>
              <div>username: {value.username}</div>
            </>
          )}
        </SessionContext.Consumer>
      </SessionProvider>
    );
    expect(screen.getByText('isLoggedIn: false')).toBeInTheDocument();
    expect(screen.getByText('username:')).toBeInTheDocument();
  });

  it('recovers session from localStorage', () => {
    Storage.prototype.getItem.mockImplementation((key) => {
      if (key === 'sessionId') return 'test-session';
      if (key === 'username') return 'testuser';
      if (key === 'avatar') return '/test_avatar.jpg';
    });

    render(
      <SessionProvider>
        <SessionContext.Consumer>
          {(value) => (
            <>
              <div>sessionId: {value.sessionId}</div>
              <div>username: {value.username}</div>
              <div>avatar: {value.avatar}</div>
            </>
          )}
        </SessionContext.Consumer>
      </SessionProvider>
    );

    expect(screen.getByText('sessionId: test-session')).toBeInTheDocument();
    expect(screen.getByText('username: testuser')).toBeInTheDocument();
    expect(screen.getByText('avatar: /test_avatar.jpg')).toBeInTheDocument();
  });

  it('creates a new session', () => {
    render(
      <SessionProvider>
        <SessionContext.Consumer>
          {(value) => (
            <button onClick={() => value.createSession('newUser')}>Create Session</button>
          )}
        </SessionContext.Consumer>
      </SessionProvider>
    );

    act(() => {
      screen.getByText('Create Session').click();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('sessionId', expect.any(String));
    expect(localStorage.setItem).toHaveBeenCalledWith('username', 'newUser');
    expect(localStorage.setItem).toHaveBeenCalledWith('avatar', '/default_user.jpg');
  });

  it('destroys the session correctly', () => {
    render(
      <SessionProvider>
        <SessionContext.Consumer>
          {(value) => (
            <button onClick={value.destroySession}>Destroy Session</button>
          )}
        </SessionContext.Consumer>
      </SessionProvider>
    );

    act(() => {
      screen.getByText('Destroy Session').click();
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('sessionId');
    expect(localStorage.removeItem).toHaveBeenCalledWith('username');
  });

  it('updates the avatar correctly', () => {
    render(
      <SessionProvider>
        <SessionContext.Consumer>
          {(value) => (
            <button onClick={() => value.updateAvatar('/new_avatar.jpg')}>Update Avatar</button>
          )}
        </SessionContext.Consumer>
      </SessionProvider>
    );

    act(() => {
      screen.getByText('Update Avatar').click();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('avatar', '/new_avatar.jpg');
  });
});
