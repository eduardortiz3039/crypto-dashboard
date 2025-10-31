import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock de fetch
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('muestra el estado de carga inicial', () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    
    render(<App />);
    
    expect(screen.getByText(/Cargando datos.../i)).toBeInTheDocument();
  });

  test('renderiza el dashboard después de cargar datos', async () => {
    const mockData = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://example.com/btc.png',
        current_price: 50000,
        price_change_percentage_24h: 2.5,
        market_cap: 1000000000
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard de Criptomonedas/i)).toBeInTheDocument();
    });
  });

  test('muestra mensaje de error cuando falla la API', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar los datos/i)).toBeInTheDocument();
    });
  });

  test('botón de actualizar llama a refetch', async () => {
    const mockData = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://example.com/btc.png',
        current_price: 50000,
        price_change_percentage_24h: 2.5,
        market_cap: 1000000000
      }
    ];

    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard de Criptomonedas/i)).toBeInTheDocument();
    });

    const refreshButton = screen.getByLabelText(/Actualizar datos/i);
    fireEvent.click(refreshButton);

    expect(fetch).toHaveBeenCalledTimes(3); // Initial + refetch + historical
  });
});
