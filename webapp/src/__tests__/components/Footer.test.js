import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Footer from '../../components/Footer.js';
import '../../localize/i18n.js';

describe('Footer component', () => {
  beforeEach(() => {
    render(
        <Footer />
    );
  });

  it('should render elements', async () => {
    await waitFor(() => screen.getByText(/WICHAT/));

    const link = screen.getByText(/© WICHAT_ES1A/);
    await expect(link).toBeInTheDocument();
  });

});
