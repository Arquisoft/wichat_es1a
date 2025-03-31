import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ChatRoom from '../ChatRoom';
import io from 'socket.io-client';

jest.mock('socket.io-client');

describe('ChatRoom Component', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
    };
    io.mockReturnValue(mockSocket);
  });

  test('renders the chat room title', () => {
    render(<ChatRoom roomCode="1234" username="testuser" />);
    expect(screen.getByText(/chat_title/i)).toBeInTheDocument();
  });

  test('sends message when send button is clicked', () => {
    render(<ChatRoom roomCode="1234" username="testuser" />);

    const input = screen.getByLabelText(/chat_input_label/i);
    fireEvent.change(input, { target: { value: 'Hello, world!' } });

    const sendButton = screen.getByText(/send/i);
    fireEvent.click(sendButton);

    expect(mockSocket.emit).toHaveBeenCalledWith('send-message', 'Hello, world!', '1234', 'testuser');
  });

  test('sends message when Enter key is pressed', () => {
    render(<ChatRoom roomCode="1234" username="testuser" />);

    const input = screen.getByLabelText(/chat_input_label/i);
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockSocket.emit).toHaveBeenCalledWith('send-message', 'Hello, world!', '1234', 'testuser');
  });

  test('receives and displays messages', () => {
    render(<ChatRoom roomCode="1234" username="testuser" />);

    const messageHandler = mockSocket.on.mock.calls.find(call => call[0] === 'recieved-message')[1];
    messageHandler({ username: 'user1', message: 'Hello!' });

    expect(screen.getByText(/user1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Hello!/i)).toBeInTheDocument();
  });
});
