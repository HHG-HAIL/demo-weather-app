import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
import axios from 'axios';

// Mock axios to prevent actual API calls
jest.mock('axios');

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, style }) => (
    <div 
      data-testid="map-container" 
      data-center={JSON.stringify(center)}
      data-zoom={zoom}
      style={style}
    >
      {children}
    </div>
  ),
  TileLayer: ({ url, attribution }) => (
    <div data-testid="tile-layer" data-url={url} data-attribution={attribution} />
  ),
  Marker: ({ children, position }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }) => (
    <div data-testid="popup">{children}</div>
  ),
}));

// Mock react-awesome-button
jest.mock('react-awesome-button', () => ({
  AwesomeButton: ({ children, onPress, type, style }) => (
    <button 
      onClick={() => {
        if (onPress) {
          const result = onPress();
          // Handle promise return if any
          if (result && typeof result.then === 'function') {
            result.catch(() => {}); // Prevent unhandled promise
          }
        }
      }} 
      data-type={type} 
      style={style}
    >
      {children}
    </button>
  ),
}));

// Mock react-loader-spinner
jest.mock('react-loader-spinner', () => ({
  MagnifyingGlass: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock react-select
jest.mock('react-select', () => {
  return ({ value, onChange, options }) => (
    <select
      data-testid="unit-select"
      value={value?.value}
      onChange={(e) => {
        const option = options.find(opt => opt.value === e.target.value);
        onChange(option);
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
});

describe('Geolocation & Map Integration Tests', () => {
  let mockGeolocation;

  beforeEach(() => {
    // Setup geolocation mock
    mockGeolocation = {
      getCurrentPosition: jest.fn(),
    };
    global.navigator.geolocation = mockGeolocation;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Successful Geolocation Retrieval
  describe('1. Successful Geolocation Retrieval', () => {
    it('should retrieve geolocation, render MapComponent, and change button text', async () => {
      // Arrange
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(<App />);

      // Act
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert
      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      });

      // Verify MapComponent is rendered
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();

      // Verify MapComponent receives correct lat/lng props
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([40.7128, -74.0060]);

      // Verify button text changes to "Close Map"
      const closeMapButton = screen.getByText('Close Map');
      expect(closeMapButton).toBeInTheDocument();

      // Verify no error alert appears
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  // Test Case 2: Geolocation Permission Denied
  describe('2. Geolocation Permission Denied', () => {
    it('should display error alert when permission is denied', async () => {
      // Arrange
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied the request for Geolocation.',
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      render(<App />);

      // Act
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert
      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      });

      // Verify error alert displays with error message
      const errorAlert = await screen.findByText(mockError.message);
      expect(errorAlert).toBeInTheDocument();

      // Verify MapComponent does not render
      expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();

      // Verify button remains "Open Map"
      const openMapButtonAfter = screen.getByText('Open Map');
      expect(openMapButtonAfter).toBeInTheDocument();
    });
  });

  // Test Case 3: Geolocation Not Supported
  describe('3. Geolocation Not Supported', () => {
    it('should display error when geolocation is not supported', async () => {
      // Arrange
      delete global.navigator.geolocation;

      render(<App />);

      // Act
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert
      await waitFor(() => {
        const errorMessage = screen.getByText('Geolocation is not supported by this browser.');
        expect(errorMessage).toBeInTheDocument();
      });

      // Verify MapComponent does not render
      expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
    });
  });

  // Test Case 4: Toggle Map Open/Close
  describe('4. Toggle Map Open/Close', () => {
    it('should toggle map visibility and clear userLocation state', async () => {
      // Arrange
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(<App />);

      // Act - Open map
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert - Map is visible
      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toBeInTheDocument();
      });

      const closeMapButton = screen.getByText('Close Map');
      expect(closeMapButton).toBeInTheDocument();

      // Act - Close map
      fireEvent.click(closeMapButton);

      // Assert - Map is hidden
      await waitFor(() => {
        expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
      });

      // Verify button text returns to "Open Map"
      const openMapButtonAfter = screen.getByText('Open Map');
      expect(openMapButtonAfter).toBeInTheDocument();
    });
  });

  // Test Case 5: Map Display with Coordinates
  describe('5. Map Display with Coordinates', () => {
    it('should display map with correct coordinates, marker, and popup', async () => {
      // Arrange
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(<App />);

      // Act
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert
      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toBeInTheDocument();
      });

      // Verify MapContainer centers on correct coordinates
      const mapContainer = screen.getByTestId('map-container');
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([40.7128, -74.0060]);

      // Verify map dimensions are 300x300px
      expect(mapContainer.style.height).toBe('300px');
      expect(mapContainer.style.width).toBe('300px');

      // Verify Marker is placed at correct position
      const marker = screen.getByTestId('marker');
      const markerPosition = JSON.parse(marker.getAttribute('data-position'));
      expect(markerPosition).toEqual([40.7128, -74.0060]);

      // Verify Popup contains "You are here." text
      const popup = screen.getByTestId('popup');
      expect(popup).toHaveTextContent('You are here.');
    });
  });

  // Test Case 6: Concurrent Geolocation and Weather Search
  describe('6. Concurrent Geolocation and Weather Search', () => {
    it('should handle weather search and geolocation independently without conflicts', async () => {
      // Arrange
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const mockWeatherData = {
        data: {
          name: 'New York',
          main: {
            temp: 72,
            feels_like: 70,
            humidity: 65,
            temp_max: 75,
          },
          weather: [{ main: 'Clear', icon: '01d' }],
          wind: { speed: 5 },
        },
      };
      
      // Mock axios.get to return a promise
      axios.get.mockResolvedValue(mockWeatherData);

      render(<App />);

      // Act - Perform weather search
      const searchInput = screen.getByPlaceholderText('Search Location');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);

      // Wait for weather data to load
      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Act - Open map for user's geolocation
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert - Both features work independently
      await waitFor(() => {
        // Weather data is still displayed
        expect(screen.getByText('New York')).toBeInTheDocument();
        expect(screen.getByText('72°C')).toBeInTheDocument();

        // Map is displayed
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });

      // Verify map has correct coordinates (not weather location)
      const mapContainer = screen.getByTestId('map-container');
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([40.7128, -74.0060]);

      // Verify no state conflicts
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  // Additional Test: Multiple error types
  describe('Additional: Various Geolocation Error Types', () => {
    it('should handle POSITION_UNAVAILABLE error', async () => {
      // Arrange
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable.',
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      render(<App />);

      // Act
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert
      await waitFor(() => {
        const errorAlert = screen.getByText(mockError.message);
        expect(errorAlert).toBeInTheDocument();
      });
    });

    it('should handle TIMEOUT error', async () => {
      // Arrange
      const mockError = {
        code: 3, // TIMEOUT
        message: 'Request timeout.',
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      render(<App />);

      // Act
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert
      await waitFor(() => {
        const errorAlert = screen.getByText(mockError.message);
        expect(errorAlert).toBeInTheDocument();
      });
    });
  });
});
