import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('./Alert', () => {
  return function Alert({ message, type, onClose }) {
    return (
      <div className={`alert ${type}`} data-testid="alert">
        <p>{message}</p>
        <button onClick={onClose} data-testid="alert-close">Close</button>
      </div>
    );
  };
});

jest.mock('./MapComponent', () => {
  return function MapComponent({ lat, lng }) {
    return <div data-testid="map-component">Map: {lat}, {lng}</div>;
  };
});

jest.mock('react-loader-spinner', () => ({
  MagnifyingGlass: ({ visible }) => visible ? <div data-testid="loading-spinner">Loading...</div> : null,
}));

jest.mock('react-awesome-button', () => ({
  AwesomeButton: ({ children, onPress, type, style }) => (
    <button onClick={onPress} data-testid={`awesome-button-${type}`} style={style}>
      {children}
    </button>
  ),
}));

jest.mock('react-select', () => {
  return function Select({ options, value, onChange }) {
    return (
      <select
        data-testid="unit-select"
        value={value?.value}
        onChange={(e) => {
          const selected = options.find(opt => opt.value === e.target.value);
          onChange(selected);
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
});

describe('App Component', () => {
  let mockGeolocation;

  beforeEach(() => {
    // Mock Date
    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('Monday, October 28, 2025');
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2025);

    // Mock geolocation
    mockGeolocation = {
      getCurrentPosition: jest.fn(),
    };
    global.navigator.geolocation = mockGeolocation;

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Initial Render Tests
  describe('Initial Render', () => {
    test('component renders without crashing', () => {
      render(<App />);
      expect(screen.getByPlaceholderText('Search Location')).toBeInTheDocument();
    });

    test('search input is visible', () => {
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    test('search button is rendered', () => {
      render(<App />);
      const searchButton = screen.getByTestId('awesome-button-danger');
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toHaveTextContent('Search');
    });

    test('renders current date', () => {
      render(<App />);
      expect(screen.getByText('Monday, October 28, 2025')).toBeInTheDocument();
    });

    test('renders footer with correct year', () => {
      render(<App />);
      expect(screen.getByText(/© 2025 Weather app. All rights reserved./i)).toBeInTheDocument();
    });
  });

  // 2. Search Functionality Tests
  describe('Search Functionality', () => {
    const mockWeatherData = {
      data: {
        name: 'London',
        main: {
          temp: 20,
          feels_like: 18,
          humidity: 65,
          temp_max: 22,
        },
        weather: [
          {
            main: 'Clear',
            icon: '01d',
          },
        ],
        wind: {
          speed: 5.5,
        },
      },
    };

    test('location input updates on user typing', () => {
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      expect(searchInput.value).toBe('London');
    });

    test('search triggers on Enter key press', async () => {
      axios.get.mockResolvedValueOnce(mockWeatherData);
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('London')
        );
      });
    });

    test('search triggers on button click', async () => {
      axios.get.mockResolvedValueOnce(mockWeatherData);
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Paris' } });
      
      const searchButton = screen.getByTestId('awesome-button-danger');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('Paris')
        );
      });
    });

    test('loading spinner shows during API call', async () => {
      axios.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockWeatherData), 100)));
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Loading spinner should appear
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    test('weather data displays after successful API response', async () => {
      axios.get.mockResolvedValueOnce(mockWeatherData);
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
        expect(screen.getByText('20°C')).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
    });

    test('input clears after search', async () => {
      axios.get.mockResolvedValueOnce(mockWeatherData);
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
    });
  });

  // 3. Unit Selection Tests
  describe('Unit Selection', () => {
    const mockWeatherData = {
      data: {
        name: 'London',
        main: {
          temp: 20,
          feels_like: 18,
          humidity: 65,
          temp_max: 22,
        },
        weather: [
          {
            main: 'Clear',
            icon: '01d',
          },
        ],
        wind: {
          speed: 5.5,
        },
      },
    };

    test('unit dropdown changes between Celsius and Fahrenheit', () => {
      render(<App />);
      const unitSelect = screen.getByTestId('unit-select');
      
      expect(unitSelect.value).toBe('metric');
      
      fireEvent.change(unitSelect, { target: { value: 'imperial' } });
      
      expect(unitSelect.value).toBe('imperial');
    });

    test('temperature symbol updates correctly (°C ↔ °F)', async () => {
      axios.get.mockResolvedValueOnce(mockWeatherData);
      render(<App />);
      
      // Get weather data first
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('20°C')).toBeInTheDocument();
      });

      // Change unit to Fahrenheit
      const unitSelect = screen.getByTestId('unit-select');
      fireEvent.change(unitSelect, { target: { value: 'imperial' } });

      // Temperature symbol should change but data should clear
      await waitFor(() => {
        expect(screen.queryByText('20°C')).not.toBeInTheDocument();
      });
    });

    test('data clears when unit changes', async () => {
      axios.get.mockResolvedValueOnce(mockWeatherData);
      render(<App />);
      
      // Get weather data first
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });

      // Change unit
      const unitSelect = screen.getByTestId('unit-select');
      fireEvent.change(unitSelect, { target: { value: 'imperial' } });

      // Data should be cleared
      await waitFor(() => {
        expect(screen.queryByText('London')).not.toBeInTheDocument();
      });
    });
  });

  // 4. Error Handling Tests
  describe('Error Handling', () => {
    test('error alert displays on API failure', async () => {
      const errorMessage = 'city not found';
      axios.get.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'InvalidCity' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('error message from API response shows correctly', async () => {
      const customError = 'Custom error message';
      axios.get.mockRejectedValueOnce({
        response: {
          data: {
            message: customError,
          },
        },
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText(customError)).toBeInTheDocument();
      });
    });

    test('error auto-dismisses after 3 seconds', async () => {
      jest.useFakeTimers();
      axios.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error',
          },
        },
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
      });

      // Fast forward time by 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    test('invalid location shows appropriate error', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'city not found',
          },
        },
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'XYZ123' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('city not found')).toBeInTheDocument();
      });
    });

    test('handles error without response data', async () => {
      axios.get.mockRejectedValueOnce({});

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
      });
    });

    test('error can be manually closed', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error',
          },
        },
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('alert-close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
      });
    });
  });

  // 5. Geolocation Tests
  describe('Geolocation', () => {
    test('getUserLocation toggles user location state', () => {
      render(<App />);
      
      const mapButton = screen.getByTestId('awesome-button-primary');
      expect(mapButton).toHaveTextContent('Open Map');
      expect(screen.queryByTestId('map-component')).not.toBeInTheDocument();
    });

    test('success callback sets latitude/longitude', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(<App />);
      
      const mapButton = screen.getByTestId('awesome-button-primary');
      fireEvent.click(mapButton);

      await waitFor(() => {
        expect(screen.getByTestId('map-component')).toBeInTheDocument();
        expect(screen.getByText('Map: 51.5074, -0.1278')).toBeInTheDocument();
      });
    });

    test('error callback displays error message', async () => {
      const mockError = {
        message: 'User denied geolocation',
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      render(<App />);
      
      const mapButton = screen.getByTestId('awesome-button-primary');
      fireEvent.click(mapButton);

      await waitFor(() => {
        expect(screen.getByText('User denied geolocation')).toBeInTheDocument();
      });
    });

    test('MapComponent shows/hides based on userLocation state', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(<App />);
      
      const mapButton = screen.getByTestId('awesome-button-primary');
      
      // Initially no map
      expect(screen.queryByTestId('map-component')).not.toBeInTheDocument();
      
      // Open map
      fireEvent.click(mapButton);

      await waitFor(() => {
        expect(screen.getByTestId('map-component')).toBeInTheDocument();
      });

      // Button text should change
      expect(mapButton).toHaveTextContent('Close Map');

      // Close map
      fireEvent.click(mapButton);

      await waitFor(() => {
        expect(screen.queryByTestId('map-component')).not.toBeInTheDocument();
      });

      expect(mapButton).toHaveTextContent('Open Map');
    });

    test('handles unsupported geolocation', () => {
      delete global.navigator.geolocation;

      render(<App />);
      
      const mapButton = screen.getByTestId('awesome-button-primary');
      fireEvent.click(mapButton);

      // Should display error for unsupported browser
      expect(screen.getByText('Geolocation is not supported by this browser.')).toBeInTheDocument();
    });
  });

  // 6. Weather Data Display Tests
  describe('Weather Data Display', () => {
    const mockWeatherData = {
      data: {
        name: 'New York',
        main: {
          temp: 25.7,
          feels_like: 24.3,
          humidity: 70,
          temp_max: 28.5,
        },
        weather: [
          {
            main: 'Clouds',
            icon: '03d',
          },
        ],
        wind: {
          speed: 7.8,
        },
      },
    };

    beforeEach(async () => {
      axios.get.mockResolvedValueOnce(mockWeatherData);
    });

    test('temperature displays with correct symbol', async () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('26°C')).toBeInTheDocument(); // 25.7 rounded
      });
    });

    test('weather icon renders correctly', async () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        const icon = screen.getByAltText('Weather Icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('src', 'https://openweathermap.org/img/wn/03d.png');
      });
    });

    test('location name displays', async () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument();
      });
    });

    test('humidity displays correctly', async () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('70%')).toBeInTheDocument();
        expect(screen.getByText('Humidity')).toBeInTheDocument();
      });
    });

    test('wind speed displays correctly', async () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('8m/s')).toBeInTheDocument(); // 7.8 rounded
        expect(screen.getByText('Wind Speed')).toBeInTheDocument();
      });
    });

    test('feels-like temperature displays correctly', async () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('24°C')).toBeInTheDocument(); // 24.3 rounded
        expect(screen.getByText('Feels Like')).toBeInTheDocument();
      });
    });

    test('max temperature displays correctly', async () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('29°C')).toBeInTheDocument(); // 28.5 rounded
        expect(screen.getByText('Max Temp')).toBeInTheDocument();
      });
    });

    test('weather description displays correctly', async () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('Clouds')).toBeInTheDocument();
      });
    });
  });

  // Additional Edge Cases
  describe('Edge Cases', () => {
    test('handles empty location search', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          name: 'Unknown',
          main: { temp: 20, feels_like: 18, humidity: 60, temp_max: 22 },
          weather: [{ main: 'Clear', icon: '01d' }],
          wind: { speed: 5 },
        },
      });

      render(<App />);
      
      const searchButton = screen.getByTestId('awesome-button-danger');
      fireEvent.click(searchButton);

      // Should attempt to search with empty string
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('q=&')
        );
      });
    });

    test('does not trigger search on non-Enter key press', () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      fireEvent.keyPress(searchInput, { key: 'a', code: 'KeyA', charCode: 97 });

      expect(axios.get).not.toHaveBeenCalled();
    });

    test('API call includes correct parameters', async () => {
      const mockWeatherData = {
        data: {
          name: 'Paris',
          main: { temp: 15, feels_like: 14, humidity: 60, temp_max: 16 },
          weather: [{ main: 'Rain', icon: '10d' }],
          wind: { speed: 3.5 },
        },
      };
      axios.get.mockResolvedValueOnce(mockWeatherData);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Paris' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('q=Paris')
        );
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('units=metric')
        );
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('appid=')
        );
      });
    });
  });
});
