import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, style }) => (
    <div data-testid="map-container" data-center={JSON.stringify(center)} data-zoom={zoom} style={style}>
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

// Mock leaflet
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: undefined,
      },
      mergeOptions: jest.fn(),
    },
  },
}));

// Mock react-awesome-button
jest.mock('react-awesome-button', () => ({
  AwesomeButton: ({ children, onPress, type, style }) => (
    <button
      data-testid={`awesome-button-${type}`}
      onClick={onPress}
      style={style}
    >
      {children}
    </button>
  ),
}));

// Mock axios to prevent API calls
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
  },
}));

// Mock react-loader-spinner
jest.mock('react-loader-spinner', () => ({
  MagnifyingGlass: () => <div data-testid="loading-spinner" />,
}));

// Mock react-select
jest.mock('react-select', () => {
  return ({ options, value, onChange, className, styles }) => (
    <select
      data-testid="unit-select"
      className={className}
      value={value?.value || ''}
      onChange={(e) => {
        const option = options.find(opt => opt.value === e.target.value);
        onChange(option);
      }}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

describe('Geolocation and Map Display Flow Integration Tests', () => {
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

  describe('Success Path', () => {
    test('should display map with user location when geolocation permission is granted', async () => {
      // Arrange
      const mockCoords = {
        latitude: 40.7128,
        longitude: -74.0060,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: mockCoords,
        });
      });

      render(<App />);

      // Act
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert
      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toBeInTheDocument();
      });

      const mapContainer = screen.getByTestId('map-container');
      const center = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(center[0]).toBe(mockCoords.latitude);
      expect(center[1]).toBe(mockCoords.longitude);

      // Verify marker is displayed at correct position
      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
      const markerPosition = JSON.parse(marker.getAttribute('data-position'));
      expect(markerPosition[0]).toBe(mockCoords.latitude);
      expect(markerPosition[1]).toBe(mockCoords.longitude);

      // Verify popup text
      const popup = screen.getByTestId('popup');
      expect(popup).toHaveTextContent('You are here.');

      // Verify button text changes to "Close Map"
      expect(screen.getByText('Close Map')).toBeInTheDocument();
    });
  });

  describe('Failure Path', () => {
    test('should display error alert when geolocation permission is denied', async () => {
      // Arrange
      const mockError = {
        message: 'User denied Geolocation',
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

      await waitFor(() => {
        const alert = screen.getByText(mockError.message);
        expect(alert).toBeInTheDocument();
      });

      // Verify map is not rendered
      expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();

      // Verify button still shows "Open Map"
      expect(screen.getByText('Open Map')).toBeInTheDocument();
    });

    test('should display error when geolocation is not supported', async () => {
      // Arrange
      delete global.navigator.geolocation;

      render(<App />);

      // Act
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert
      await waitFor(() => {
        const alert = screen.getByText('Geolocation is not supported by this browser.');
        expect(alert).toBeInTheDocument();
      });

      // Verify map is not rendered
      expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
    });
  });

  describe('Toggle Path', () => {
    test('should hide map when user clicks Close Map button', async () => {
      // Arrange
      const mockCoords = {
        latitude: 51.5074,
        longitude: -0.1278,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: mockCoords,
        });
      });

      render(<App />);

      // Act - Open map
      const openMapButton = screen.getByText('Open Map');
      fireEvent.click(openMapButton);

      // Assert - Map is visible
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });

      expect(screen.getByText('Close Map')).toBeInTheDocument();

      // Act - Close map
      const closeMapButton = screen.getByText('Close Map');
      fireEvent.click(closeMapButton);

      // Assert - Map is hidden
      await waitFor(() => {
        expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Open Map')).toBeInTheDocument();
    });

    test('should be able to reopen map after closing', async () => {
      // Arrange
      const mockCoords = {
        latitude: 48.8566,
        longitude: 2.3522,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: mockCoords,
        });
      });

      render(<App />);

      // Act - Open map
      fireEvent.click(screen.getByText('Open Map'));
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });

      // Act - Close map
      fireEvent.click(screen.getByText('Close Map'));
      await waitFor(() => {
        expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
      });

      // Act - Reopen map
      fireEvent.click(screen.getByText('Open Map'));

      // Assert - Geolocation is requested again
      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });
    });
  });

  describe('Multi-module Integration', () => {
    test('should integrate App, MapComponent, and Alert components correctly', async () => {
      // Arrange
      const mockCoords = {
        latitude: 35.6762,
        longitude: 139.6503,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: mockCoords,
        });
      });

      render(<App />);

      // Act - Trigger geolocation
      const openMapButton = screen.getByText('Open Map');
      expect(openMapButton).toBeInTheDocument(); // App.js renders button

      fireEvent.click(openMapButton);

      // Assert - MapComponent is rendered with correct props
      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toBeInTheDocument(); // MapComponent.js renders map
        
        const center = JSON.parse(mapContainer.getAttribute('data-center'));
        expect(center).toEqual([mockCoords.latitude, mockCoords.longitude]);
      });

      // Verify no error alert is displayed (Alert.jsx)
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    test('should integrate App and Alert components on geolocation error', async () => {
      // Arrange
      const errorMessage = 'Location access blocked';
      
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ message: errorMessage });
      });

      render(<App />);

      // Act
      fireEvent.click(screen.getByText('Open Map'));

      // Assert - Alert.jsx component displays error
      await waitFor(() => {
        const alertElement = screen.getByText(errorMessage);
        expect(alertElement).toBeInTheDocument();
      });

      // Verify the close button from Alert component works
      const closeButton = screen.getByRole('button', { name: /✖|close/i });
      expect(closeButton).toBeInTheDocument();
      
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
      });
    });
  });
});
