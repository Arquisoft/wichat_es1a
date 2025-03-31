import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PictureGame from './PictureGame';

// Mock de las imágenes para evitar problemas con imports
jest.mock('../path/to/images', () => [{ src: 'img1.jpg', alt: 'Image 1' }, { src: 'img2.jpg', alt: 'Image 2' }]);

describe('PictureGame Component', () => {
    test('renders the component correctly', () => {
        render(<PictureGame />);

        expect(screen.getByText('Seleccione la imagen correcta')).toBeInTheDocument();
    });

    test('displays two images', () => {
        render(<PictureGame />);

        const images = screen.getAllByRole('img');
        expect(images.length).toBe(2);
    });

    test('handles correct and incorrect selections', () => {
        render(<PictureGame />);

        const images = screen.getAllByRole('img');
        fireEvent.click(images[0]);

        expect(screen.getByText(/Correcto|Incorrecto/i)).toBeInTheDocument();
    });
});