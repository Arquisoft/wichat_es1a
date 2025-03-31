import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CardComponent from './CardComponent';

describe('CardComponent', () => {
    const mockProps = {
        imageUrl: 'test-image.jpg',
        title: 'Test Title',
        isActive: false,
    };

    test('renders without crashing', () => {
        render(<CardComponent {...mockProps} />);
        expect(screen.getByAltText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    test('applies hover styles on mouse enter', () => {
        render(<CardComponent {...mockProps} />);
        const card = screen.getByAltText('Test Title').parentElement;

        fireEvent.mouseEnter(card);
        expect(card).toHaveStyle('transform: scale(1.04) rotate(-1deg)');
    });

    test('removes hover styles on mouse leave', () => {
        render(<CardComponent {...mockProps} />);
        const card = screen.getByAltText('Test Title').parentElement;

        fireEvent.mouseEnter(card);
        fireEvent.mouseLeave(card);
        expect(card).toHaveStyle('transform: scale(1) rotate(0deg)');
    });

    test('applies active styles when isActive is true', () => {
        render(<CardComponent {...mockProps} isActive={true} />);
        const card = screen.getByAltText('Test Title').parentElement;
        expect(card).toHaveStyle('transform: scale(1.04) rotate(-1deg)');
    });
});
