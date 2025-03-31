import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Footer from '../Footer';

describe('Footer Component', () => {
  test('renders the footer with correct text', () => {
    render(<Footer />);
    expect(screen.getByText(/© WICHAT-ES1A/i)).toBeInTheDocument();
  });

  test('contains a link to the GitHub repository', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /© WICHAT-ES1A/i });
    expect(link).toHaveAttribute('href', 'https://github.com/Arquisoft/wichat_es1a');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });
});
