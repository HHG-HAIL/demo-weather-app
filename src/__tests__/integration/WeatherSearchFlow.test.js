import React from 'react';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock axios before importing App
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
  },
  get: jest.fn(),
}));

import axios from 'axios';
import App from '../../App';

// Mock react-awesome-button
jest.mock('react-awesome-button', () => ({
  AwesomeButton: ({ children, onPress, ...props }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
}));

// Mock react-select
jest.mock('react-select', () => ({ options, value, onChange, ...props }) => (
  <select
    data-testid="unit-select"
    value={value?.value}
    onChange={(e) => {
      const selectedOption = options.find(opt => opt.value === e.target.value);
      onChange(selectedOption);
    }}
    {...props}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
));

// Mock MapComponent
jest.mock('../../MapComponent', () => {
  return function MapComponent() {
    return <div data-testid="map-component">Map</div>;
  };
});

// Mock react-loader-spinner
jest.mock('react-loader-spinner', () => ({
  MagnifyingGlass: (props) => {
    return props.visible ? <div data-testid="loading-spinner">Loading...</div> : null;
  },
}));

describe('Weather Search Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Path', () => {
    it('should display weather data when user searches for a valid city', async () => {
      // Arrange
      const mockWeatherData = {
        data: {
          name: 'London',
          main: {
            temp: 15.5,
            feels_like: 14.2,
            humidity: 72,
            temp_max: 17.0,
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

      axios.get.mockResolvedValueOnce(mockWeatherData);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByText('Search');

      // Act
      await userEvent.type(searchInput, 'London');
      await userEvent.click(searchButton);

      // Assert - Loading spinner appears
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Assert - Loading spinner disappears and weather data is displayed
      await waitForElementToBeRemoved(() => screen.queryByTestId('loading-spinner'));

      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('16°C')).toBeInTheDocument(); // temp.toFixed()
      expect(screen.getByText('Clouds')).toBeInTheDocument();
      expect(screen.getByText('14°C')).toBeInTheDocument(); // feels_like.toFixed()
      expect(screen.getByText('72%')).toBeInTheDocument();
      expect(screen.getByText('17°C')).toBeInTheDocument(); // temp_max.toFixed()
      expect(screen.getByText('6m/s')).toBeInTheDocument(); // wind.speed.toFixed()
      expect(screen.getByText('Feels Like')).toBeInTheDocument();
      expect(screen.getByText('Humidity')).toBeInTheDocument();
      expect(screen.getByText('Max Temp')).toBeInTheDocument();
      expect(screen.getByText('Wind Speed')).toBeInTheDocument();

      // Verify API was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('London')
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('api.openweathermap.org')
      );
    });

    it('should display weather data when user presses Enter key', async () => {
      // Arrange
      const mockWeatherData = {
        data: {
          name: 'Paris',
          main: {
            temp: 18.3,
            feels_like: 17.5,
            humidity: 65,
            temp_max: 20.0,
          },
          weather: [
            {
              main: 'Clear',
              icon: '01d',
            },
          ],
          wind: {
            speed: 3.2,
          },
        },
      };

      axios.get.mockResolvedValueOnce(mockWeatherData);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Search Location');

      // Act
      await userEvent.type(searchInput, 'Paris');
      await userEvent.keyboard('{Enter}');

      // Assert - Loading spinner appears
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Assert - Weather data is displayed
      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });

      expect(screen.getAllByText('18°C').length).toBeGreaterThan(0);
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('Failure Path', () => {
    it('should display error alert when user searches for an invalid city', async () => {
      // Arrange
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
      const searchButton = screen.getByText('Search');

      // Act
      await userEvent.type(searchInput, 'InvalidCityName123');
      await userEvent.click(searchButton);

      // Assert - Loading spinner appears
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Assert - Loading spinner disappears
      await waitForElementToBeRemoved(() => screen.queryByTestId('loading-spinner'));

      // Assert - Error alert is displayed
      expect(screen.getByText(errorMessage)).toBeInTheDocument();

      // Assert - Error alert auto-dismisses after 3 seconds
      await waitFor(
        () => {
          expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
        },
        { timeout: 3500 }
      );
    });

    it('should display generic error message when API call fails without response data', async () => {
      // Arrange
      axios.get.mockRejectedValueOnce({
        response: null,
      });

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByText('Search');

      // Act
      await userEvent.type(searchInput, 'TestCity');
      await userEvent.click(searchButton);

      // Assert - Loading spinner appears
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Assert - Loading spinner disappears
      await waitForElementToBeRemoved(() => screen.queryByTestId('loading-spinner'));

      // Assert - Generic error message is displayed
      expect(screen.getByText('An error occurred')).toBeInTheDocument();

      // Assert - Error can be closed manually
      const closeButton = screen.getByRole('button', { name: /✖/i });
      await userEvent.click(closeButton);

      expect(screen.queryByText('An error occurred')).not.toBeInTheDocument();
    });

    it('should clear search input after search attempt', async () => {
      // Arrange
      const mockWeatherData = {
        data: {
          name: 'Tokyo',
          main: {
            temp: 22.0,
            feels_like: 21.5,
            humidity: 60,
            temp_max: 24.0,
          },
          weather: [
            {
              main: 'Sunny',
              icon: '01d',
            },
          ],
          wind: {
            speed: 4.0,
          },
        },
      };

      axios.get.mockResolvedValueOnce(mockWeatherData);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Search Location');

      // Act
      await userEvent.type(searchInput, 'Tokyo');
      await userEvent.keyboard('{Enter}');

      // Assert - Input is cleared after search
      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
    });
  });
});
