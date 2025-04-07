import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Homepage from '../pages/Homepage';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import data from '../data/gameInfo.json';
import { BrowserRouter } from 'react-router-dom';

describe('Homepage Component', () => {
    test('renders homepage with title and video', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <BrowserRouter>
                    <Homepage />
                </BrowserRouter>
            </I18nextProvider>
        );

        expect(screen.getByText(i18n.t('Homepage.title'))).toBeInTheDocument();
        expect(screen.getByTestId('video')).toBeInTheDocument();
    });

    test('renders game buttons and clicking updates game link', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <BrowserRouter>
                    <Homepage />
                </BrowserRouter>
            </I18nextProvider>
        );

        const gameButtons = screen.getAllByRole('button');
        expect(gameButtons.length).toBeGreaterThan(0);

        fireEvent.click(gameButtons[0]);
        const playButton = screen.getByRole('link', { name: i18n.t('Home') });
        expect(playButton).toHaveAttribute('href', '/pictureGame');
    });
});
