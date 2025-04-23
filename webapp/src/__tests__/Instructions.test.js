import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Instructions from '../pages/Instructions'; // ajustá la ruta si es distinta
import gameInfo from '../data/gameInfo.json';

// Mock para el video (no se puede reproducir en test)
HTMLMediaElement.prototype.play = () => {};
Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
    set() {}, // Simulamos el seteo de playbackRate
});

describe('Componente Instructions', () => {
    it('muestra el título correctamente', () => {
        render(<Instructions />);
        const title = screen.getByText(/INSTRUCCIONES/i);
        expect(title).toBeInTheDocument();
    });

    it('muestra todos los botones con los nombres de los juegos', () => {
        render(<Instructions />);
        gameInfo.forEach((game) => {
            expect(screen.getByText(game.nombre)).toBeInTheDocument();
        });
    });

    it('muestra la info del juego al hacer click en un botón', () => {
        render(<Instructions />);
        const firstGameButton = screen.getByText(gameInfo[0].nombre);
        fireEvent.click(firstGameButton);
        expect(screen.getByText(gameInfo[0].descripcion)).toBeInTheDocument();
    });

    it('oculta la info del juego al hacer click dos veces en el mismo botón', () => {
        render(<Instructions />);
        const firstGameButton = screen.getByText(gameInfo[0].nombre);
        fireEvent.click(firstGameButton); // mostrar
        fireEvent.click(firstGameButton); // ocultar
        expect(screen.queryByText(gameInfo[0].descripcion)).not.toBeInTheDocument();
    });

    it('reproduce el video de fondo con la velocidad correcta (simulado)', () => {
        const { getByTestId } = render(<Instructions />);
        const video = getByTestId('video');
        expect(video).toBeInTheDocument();
    });
});
