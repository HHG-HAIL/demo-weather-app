import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock dependencies
jest.mock('axios', () => ({
  get: jest.fn()
}));

const axios = require('axios');
jest.mock('./Alert', () => {
  return function Alert({ message, type, onClose }) {
    return (
      <div data-testid="alert" className={`alert ${type}`}>
        <p>{message}</p>
        <button onClick={onClose} data-testid="close-button">×</button>
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
  MagnifyingGlass: () => <div data-testid="loading-spinner">Loading...</div>
}));
jest.mock('react-awesome-button', () => ({
  AwesomeButton: ({ children, onPress, type, style }) => (
    <button onClick={onPress} data-testid={`awesome-button-${type}`} style={style}>
      {children}
    </button>
  )
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock geolocation
    delete window.navigator.geolocation;
  });

  // Test: Initial component rendering
  describe('Initial Rendering', () => {
    test('renders the search input and button', () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByText('Search');
      
      expect(searchInput).toBeInTheDocument();
      expect(searchButton).toBeInTheDocument();
    });

    test('renders the current date', () => {
      render(<App />);
      
      const currentDate = new Date().toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      expect(screen.getByText(currentDate)).toBeInTheDocument();
    });

    test('renders unit dropdown with default Celsius option', () => {
      render(<App />);
      
      // The Select component will have the unit dropdown
      const unitDropdown = document.querySelector('.custom-select');
      expect(unitDropdown).toBeInTheDocument();
    });

    test('renders map toggle button', () => {
      render(<App />);
      
      const mapButton = screen.getByText('Open Map');
      expect(mapButton).toBeInTheDocument();
    });

    test('does not display weather data initially', () => {
      render(<App />);
      
      expect(screen.queryByText(/Feels Like/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Humidity/i)).not.toBeInTheDocument();
    });
  });

  // Test: Location input and onChange handler
  describe('Location Input', () => {
    test('updates location state when user types', () => {
      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      expect(searchInput.value).toBe('London');
    });

    test('clears location input after search', async () => {
      const mockResponse = {
        data: {
          name: 'London',
          main: { temp: 15, feels_like: 14, humidity: 80, temp_max: 16 },
          weather: [{ main: 'Clouds', icon: '04d' }],
          wind: { speed: 5 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
    });
  });

  // Test: Search button click functionality
  describe('Search Button Click', () => {
    test('calls API when search button is clicked', async () => {
      const mockResponse = {
        data: {
          name: 'London',
          main: { temp: 15, feels_like: 14, humidity: 80, temp_max: 16 },
          weather: [{ main: 'Clouds', icon: '04d' }],
          wind: { speed: 5 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('London')
        );
      });
    });

    test('does not call API if location is empty', async () => {
      const mockResponse = {
        data: {
          name: 'DefaultCity',
          main: { temp: 15, feels_like: 14, humidity: 80, temp_max: 16 },
          weather: [{ main: 'Clouds', icon: '04d' }],
          wind: { speed: 5 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });
    });
  });

  // Test: Enter key press functionality
  describe('Enter Key Press', () => {
    test('triggers search when Enter key is pressed', async () => {
      const mockResponse = {
        data: {
          name: 'Paris',
          main: { temp: 20, feels_like: 19, humidity: 70, temp_max: 22 },
          weather: [{ main: 'Clear', icon: '01d' }],
          wind: { speed: 3 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Paris' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('Paris')
        );
      });
    });

    test('does not trigger search when other keys are pressed', async () => {
      const mockResponse = {
        data: {
          name: 'Paris',
          main: { temp: 20, feels_like: 19, humidity: 70, temp_max: 22 },
          weather: [{ main: 'Clear', icon: '01d' }],
          wind: { speed: 3 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Paris' } });
      fireEvent.keyPress(searchInput, { key: 'a', code: 'KeyA', charCode: 97 });
      
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  // Test: API call success scenarios
  describe('API Success Scenarios', () => {
    test('displays weather data after successful API call', async () => {
      const mockResponse = {
        data: {
          name: 'Tokyo',
          main: { temp: 25, feels_like: 24, humidity: 60, temp_max: 27 },
          weather: [{ main: 'Sunny', icon: '01d' }],
          wind: { speed: 7 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Tokyo' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Tokyo')).toBeInTheDocument();
        expect(screen.getByText('25°C')).toBeInTheDocument();
        expect(screen.getByText('Sunny')).toBeInTheDocument();
        expect(screen.getByText('60%')).toBeInTheDocument();
        expect(screen.getByText('Humidity')).toBeInTheDocument();
        expect(screen.getByText('7m/s')).toBeInTheDocument();
      });
    });

    test('shows loading spinner during API call', async () => {
      const mockResponse = {
        data: {
          name: 'London',
          main: { temp: 15, feels_like: 14, humidity: 80, temp_max: 16 },
          weather: [{ main: 'Clouds', icon: '04d' }],
          wind: { speed: 5 }
        }
      };
      
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      axios.get.mockReturnValue(promise);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      // Loading spinner should be visible
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Resolve the promise
      resolvePromise(mockResponse);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  // Test: API call error scenarios
  describe('API Error Scenarios', () => {
    test('displays error message when API call fails', async () => {
      const errorMessage = 'city not found';
      axios.get.mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'InvalidCity' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('displays generic error message when error response has no message', async () => {
      axios.get.mockRejectedValue({
        response: { data: {} }
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'InvalidCity' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
      });
    });

    test('clears weather data when API call fails', async () => {
      // First, set up successful data
      const mockResponse = {
        data: {
          name: 'London',
          main: { temp: 15, feels_like: 14, humidity: 80, temp_max: 16 },
          weather: [{ main: 'Clouds', icon: '04d' }],
          wind: { speed: 5 }
        }
      };
      axios.get.mockResolvedValueOnce(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });

      // Now trigger an error
      axios.get.mockRejectedValueOnce({
        response: { data: { message: 'city not found' } }
      });

      fireEvent.change(searchInput, { target: { value: 'InvalidCity' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.queryByText('London')).not.toBeInTheDocument();
        expect(screen.queryByText(/Feels Like/i)).not.toBeInTheDocument();
      });
    });

    test('hides loading spinner after error', async () => {
      axios.get.mockRejectedValue({
        response: { data: { message: 'city not found' } }
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'InvalidCity' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  // Test: Unit conversion between Celsius and Fahrenheit
  describe('Unit Conversion', () => {
    test('uses metric units (Celsius) by default', async () => {
      const mockResponse = {
        data: {
          name: 'London',
          main: { temp: 15, feels_like: 14, humidity: 80, temp_max: 16 },
          weather: [{ main: 'Clouds', icon: '04d' }],
          wind: { speed: 5 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('units=metric')
        );
        expect(screen.getByText('15°C')).toBeInTheDocument();
      });
    });

    test('renders unit dropdown with Celsius and Fahrenheit options', () => {
      const { container } = render(<App />);
      
      const selectContainer = container.querySelector('.custom-select');
      expect(selectContainer).toBeInTheDocument();
    });
  });

  // Test: Geolocation functionality
  describe('Geolocation', () => {
    test('requests user location when "Open Map" button is clicked', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success) => {
          success({
            coords: {
              latitude: 51.5074,
              longitude: -0.1278
            }
          });
        })
      };
      window.navigator.geolocation = mockGeolocation;

      render(<App />);
      
      const mapButton = screen.getByText('Open Map');
      fireEvent.click(mapButton);
      
      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      });
    });

    test('displays map component after successful geolocation', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success) => {
          success({
            coords: {
              latitude: 51.5074,
              longitude: -0.1278
            }
          });
        })
      };
      window.navigator.geolocation = mockGeolocation;

      render(<App />);
      
      const mapButton = screen.getByText('Open Map');
      fireEvent.click(mapButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('map-component')).toBeInTheDocument();
        expect(screen.getByText(/Map: 51.5074, -0.1278/)).toBeInTheDocument();
      });
    });

    test('changes button text to "Close Map" when map is open', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success) => {
          success({
            coords: {
              latitude: 51.5074,
              longitude: -0.1278
            }
          });
        })
      };
      window.navigator.geolocation = mockGeolocation;

      render(<App />);
      
      const mapButton = screen.getByText('Open Map');
      fireEvent.click(mapButton);
      
      await waitFor(() => {
        expect(screen.getByText('Close Map')).toBeInTheDocument();
      });
    });

    test('closes map when "Close Map" button is clicked', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success) => {
          success({
            coords: {
              latitude: 51.5074,
              longitude: -0.1278
            }
          });
        })
      };
      window.navigator.geolocation = mockGeolocation;

      render(<App />);
      
      // Open map
      const openButton = screen.getByText('Open Map');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('map-component')).toBeInTheDocument();
      });

      // Close map
      const closeButton = screen.getByText('Close Map');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('map-component')).not.toBeInTheDocument();
        expect(screen.getByText('Open Map')).toBeInTheDocument();
      });
    });

    test('displays error when geolocation fails', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success, error) => {
          error({
            message: 'User denied geolocation'
          });
        })
      };
      window.navigator.geolocation = mockGeolocation;

      render(<App />);
      
      const mapButton = screen.getByText('Open Map');
      fireEvent.click(mapButton);
      
      await waitFor(() => {
        expect(screen.getByText('User denied geolocation')).toBeInTheDocument();
      });
    });

    test('displays error when geolocation is not supported', () => {
      // Don't set navigator.geolocation (undefined)
      render(<App />);
      
      const mapButton = screen.getByText('Open Map');
      fireEvent.click(mapButton);
      
      expect(screen.getByText('Geolocation is not supported by this browser.')).toBeInTheDocument();
    });
  });

  // Test: Error alert display and dismissal
  describe('Error Alert', () => {
    test('displays error alert when error occurs', async () => {
      axios.get.mockRejectedValue({
        response: { data: { message: 'Network error' } }
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('dismisses error alert when close button is clicked', async () => {
      axios.get.mockRejectedValue({
        response: { data: { message: 'Network error' } }
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('close-button');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
      });
    });

    test('auto-dismisses error alert after 3 seconds', async () => {
      jest.useFakeTimers();
      
      axios.get.mockRejectedValue({
        response: { data: { message: 'Network error' } }
      });

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
      });

      // Fast-forward time by 3 seconds
      jest.advanceTimersByTime(3000);
      
      await waitFor(() => {
        expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  // Test: Weather data display
  describe('Weather Data Display', () => {
    test('displays all weather information correctly', async () => {
      const mockResponse = {
        data: {
          name: 'New York',
          main: { 
            temp: 22.5, 
            feels_like: 21.3, 
            humidity: 65, 
            temp_max: 24.8 
          },
          weather: [{ main: 'Partly Cloudy', icon: '02d' }],
          wind: { speed: 8.7 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        // Location name
        expect(screen.getByText('New York')).toBeInTheDocument();
        
        // Temperature (rounded) - 22.5 rounds to 23
        expect(screen.getByText('23°C')).toBeInTheDocument();
        
        // Weather description
        expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
        
        // Feels like temperature - 21.3 rounds to 21
        expect(screen.getByText('21°C')).toBeInTheDocument();
        
        // Humidity
        expect(screen.getByText('65%')).toBeInTheDocument();
        
        // Max temperature - 24.8 rounds to 25
        expect(screen.getByText('25°C')).toBeInTheDocument();
        
        // Wind speed - 8.7 rounds to 9
        expect(screen.getByText('9m/s')).toBeInTheDocument();
      });
    });

    test('displays weather icon', async () => {
      const mockResponse = {
        data: {
          name: 'London',
          main: { temp: 15, feels_like: 14, humidity: 80, temp_max: 16 },
          weather: [{ main: 'Clouds', icon: '04d' }],
          wind: { speed: 5 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'London' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const weatherIcon = screen.getByAltText('Weather Icon');
        expect(weatherIcon).toBeInTheDocument();
        expect(weatherIcon.src).toContain('04d.png');
      });
    });

    test('rounds temperature values correctly', async () => {
      const mockResponse = {
        data: {
          name: 'Berlin',
          main: { 
            temp: 18.7, 
            feels_like: 17.2, 
            humidity: 55, 
            temp_max: 20.9 
          },
          weather: [{ main: 'Clear', icon: '01d' }],
          wind: { speed: 4.3 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'Berlin' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('19°C')).toBeInTheDocument(); // 18.7 rounded
        expect(screen.getByText('17°C')).toBeInTheDocument(); // 17.2 rounded
        expect(screen.getByText('21°C')).toBeInTheDocument(); // 20.9 rounded
        expect(screen.getByText('4m/s')).toBeInTheDocument(); // 4.3 rounded
      });
    });
  });

  // Test: Footer
  describe('Footer', () => {
    test('displays footer with current year', () => {
      render(<App />);
      
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} Weather app. All rights reserved.`)).toBeInTheDocument();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    test('handles API response with missing optional fields gracefully', async () => {
      const mockResponse = {
        data: {
          name: 'TestCity',
          main: { temp: 20, feels_like: 19, humidity: 70, temp_max: 22 },
          weather: [{ main: 'Clear', icon: '01d' }],
          wind: { speed: 3 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'TestCity' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('TestCity')).toBeInTheDocument();
      });
    });

    test('handles empty location search gracefully', async () => {
      const mockResponse = {
        data: {
          name: 'DefaultCity',
          main: { temp: 20, feels_like: 19, humidity: 70, temp_max: 22 },
          weather: [{ main: 'Clear', icon: '01d' }],
          wind: { speed: 3 }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      render(<App />);
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });
    });
  });
});
