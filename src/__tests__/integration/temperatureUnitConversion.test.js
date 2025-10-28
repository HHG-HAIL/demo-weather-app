import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../../App';

// Mock axios
jest.mock('axios');

// Mock MapComponent to avoid leaflet issues in tests
jest.mock('../../MapComponent', () => {
  return function MockMapComponent() {
    return <div data-testid="mock-map">Map Component</div>;
  };
});

// Mock react-loader-spinner to avoid potential issues
jest.mock('react-loader-spinner', () => ({
  MagnifyingGlass: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock react-awesome-button with CSS import
jest.mock('react-awesome-button', () => ({
  AwesomeButton: ({ children, onPress, ...props }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('react-awesome-button/dist/styles.css', () => {});

describe('Temperature Unit Conversion Integration Tests', () => {
  const mockWeatherDataCelsius = {
    data: {
      name: 'London',
      main: {
        temp: 20,
        feels_like: 18,
        temp_max: 22,
        humidity: 65,
      },
      weather: [
        {
          main: 'Clouds',
          icon: '04d',
        },
      ],
      wind: {
        speed: 5.5,
      },
    },
  };

  const mockWeatherDataFahrenheit = {
    data: {
      name: 'London',
      main: {
        temp: 68,
        feels_like: 64,
        temp_max: 72,
        humidity: 65,
      },
      weather: [
        {
          main: 'Clouds',
          icon: '04d',
        },
      ],
      wind: {
        speed: 5.5,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Celsius to Fahrenheit Conversion Flow', () => {
    test('should display weather in Celsius by default, then switch to Fahrenheit after unit change and re-search', async () => {
      // Arrange
      axios.get.mockResolvedValueOnce(mockWeatherDataCelsius);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByText('Search');

      // Act - Step 1: Search for a city (default unit is Celsius)
      await userEvent.type(searchInput, 'London');
      await userEvent.click(searchButton);

      // Assert - Step 2: Weather data is displayed in Celsius
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });

      // Verify temperature is displayed with Celsius symbol
      expect(screen.getByText(/20°C/)).toBeInTheDocument();
      expect(screen.getByText(/18°C/)).toBeInTheDocument(); // feels like
      expect(screen.getByText(/22°C/)).toBeInTheDocument(); // max temp

      // Verify API was called with metric units
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('units=metric')
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('q=London')
      );

      // Act - Step 3: User selects Fahrenheit from unit dropdown
      const unitDropdown = screen.getByText('Celsius (°C)');
      await userEvent.click(unitDropdown);

      const fahrenheitOption = await screen.findByText('Fahrenheit (°F)');
      await userEvent.click(fahrenheitOption);

      // Assert - Step 4: Unit symbol changes from °C to °F
      // Assert - Step 5: Weather data is cleared (user needs to search again)
      await waitFor(() => {
        expect(screen.queryByText('London')).not.toBeInTheDocument();
      });

      // Verify that the dropdown now shows Fahrenheit
      expect(screen.getByText('Fahrenheit (°F)')).toBeInTheDocument();

      // Act - Step 6: User searches again
      axios.get.mockResolvedValueOnce(mockWeatherDataFahrenheit);
      // Wait for input to be cleared after previous search
      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
      await userEvent.type(searchInput, 'London');
      await userEvent.click(searchButton);

      // Assert - Step 7: New weather data is displayed in Fahrenheit
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });

      expect(screen.getByText(/68°F/)).toBeInTheDocument();
      expect(screen.getByText(/64°F/)).toBeInTheDocument(); // feels like
      expect(screen.getByText(/72°F/)).toBeInTheDocument(); // max temp

      // Verify API was called with imperial units
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('units=imperial')
      );
    });
  });

  describe('Fahrenheit to Celsius Conversion Flow', () => {
    test('should display weather in Fahrenheit, then switch to Celsius after unit change and re-search', async () => {
      // Arrange
      render(<App />);

      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByText('Search');

      // Act - Step 1: User selects Fahrenheit first (before any search)
      const unitDropdown = screen.getByText('Celsius (°C)');
      await userEvent.click(unitDropdown);

      const fahrenheitOption = await screen.findByText('Fahrenheit (°F)');
      await userEvent.click(fahrenheitOption);

      // Verify that the dropdown now shows Fahrenheit
      expect(screen.getByText('Fahrenheit (°F)')).toBeInTheDocument();

      // Act - Search for weather in Fahrenheit
      axios.get.mockResolvedValueOnce(mockWeatherDataFahrenheit);
      await userEvent.type(searchInput, 'London');
      await userEvent.click(searchButton);

      // Assert - Step 2: Weather data is displayed in Fahrenheit
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });

      expect(screen.getByText(/68°F/)).toBeInTheDocument();
      expect(screen.getByText(/64°F/)).toBeInTheDocument(); // feels like
      expect(screen.getByText(/72°F/)).toBeInTheDocument(); // max temp

      // Verify API was called with imperial units
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('units=imperial')
      );

      // Act - Step 3: User selects Celsius from unit dropdown
      const fahrenheitDropdown = screen.getByText('Fahrenheit (°F)');
      await userEvent.click(fahrenheitDropdown);

      const celsiusOption = await screen.findByText('Celsius (°C)');
      await userEvent.click(celsiusOption);

      // Assert - Step 4: Unit symbol changes from °F to °C
      // Assert - Step 5: Weather data is cleared
      await waitFor(() => {
        expect(screen.queryByText('London')).not.toBeInTheDocument();
      });

      // Verify that the dropdown now shows Celsius
      expect(screen.getByText('Celsius (°C)')).toBeInTheDocument();

      // Act - Step 6: User searches again
      axios.get.mockResolvedValueOnce(mockWeatherDataCelsius);
      // Wait for input to be cleared after previous search
      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
      await userEvent.type(searchInput, 'London');
      await userEvent.click(searchButton);

      // Assert - Step 7: New weather data is displayed in Celsius
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });

      expect(screen.getByText(/20°C/)).toBeInTheDocument();
      expect(screen.getByText(/18°C/)).toBeInTheDocument(); // feels like
      expect(screen.getByText(/22°C/)).toBeInTheDocument(); // max temp

      // Verify API was called with metric units
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('units=metric')
      );
    });
  });

  describe('Unit Conversion Edge Cases', () => {
    test('should clear weather data when changing units without displaying errors', async () => {
      // Arrange
      axios.get.mockResolvedValueOnce(mockWeatherDataCelsius);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByText('Search');

      // Act - Search and display weather
      await userEvent.type(searchInput, 'London');
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });

      // Act - Change unit
      const unitDropdown = screen.getByText('Celsius (°C)');
      await userEvent.click(unitDropdown);

      const fahrenheitOption = await screen.findByText('Fahrenheit (°F)');
      await userEvent.click(fahrenheitOption);

      // Assert - Data should be cleared, no error messages
      await waitFor(() => {
        expect(screen.queryByText('London')).not.toBeInTheDocument();
      });

      // Verify no error alert is shown
      expect(screen.queryByRole('button', { name: '✖' })).not.toBeInTheDocument();
    });

    test('should maintain unit selection across multiple searches', async () => {
      // Arrange
      axios.get.mockResolvedValue(mockWeatherDataFahrenheit);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByText('Search');

      // Act - Change to Fahrenheit
      const unitDropdown = screen.getByText('Celsius (°C)');
      await userEvent.click(unitDropdown);

      const fahrenheitOption = await screen.findByText('Fahrenheit (°F)');
      await userEvent.click(fahrenheitOption);

      // Act - First search
      await userEvent.type(searchInput, 'London');
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });

      // Act - Second search (with the same unit)
      // Wait for input to be cleared after previous search
      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
      await userEvent.type(searchInput, 'Paris');
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
      });

      // Assert - Both calls should use imperial units
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('units=imperial')
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('units=imperial')
      );
    });
  });
});
