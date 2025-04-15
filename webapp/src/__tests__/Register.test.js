import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddUser from '../components/AddUser';
import { SessionContext } from '../SessionContext';
import axios from 'axios';

jest.mock('axios');

describe('AddUser Component', () => {
  const createSession = jest.fn();
  const updateAvatar = jest.fn();

  const renderComponent = () => {
    render(
      <SessionContext.Provider value={{ createSession, updateAvatar }}>
        <MemoryRouter>
          <AddUser />
        </MemoryRouter>
      </SessionContext.Provider>
    );
  };

  test('renders correctly', () => {
    renderComponent();
    expect(screen.getByTestId('username')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('name')).toBeInTheDocument();
    expect(screen.getByTestId('surname')).toBeInTheDocument();
    expect(screen.getByTestId('register-button')).toBeInTheDocument();
  });

  test('handles user registration successfully', async () => {
    axios.post.mockResolvedValueOnce({}); // Mocking user registration response
    axios.post.mockResolvedValueOnce({ data: { avatar: 'avatar_url' } }); // Mocking login response

    renderComponent();
    fireEvent.change(screen.getByTestId('username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByTestId('surname'), { target: { value: 'User' } });
    fireEvent.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(updateAvatar).toHaveBeenCalledWith('avatar_url');
      expect(createSession).toHaveBeenCalledWith('testuser');
    });
  });

  test('handles registration error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Registration failed' } } });

    renderComponent();
    fireEvent.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(screen.getByText('Error: Registration failed')).toBeInTheDocument();
    });
  });
});