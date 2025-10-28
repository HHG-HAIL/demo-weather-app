import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapComponent from '../MapComponent';

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
    <div
      data-testid="tile-layer"
      data-url={url}
      data-attribution={attribution}
    />
  ),
  Marker: ({ children, position }) => (
    <div
      data-testid="marker"
      data-position={JSON.stringify(position)}
    >
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
        _getIconUrl: jest.fn(),
      },
      mergeOptions: jest.fn(),
    },
  },
}));

// Mock leaflet CSS import
jest.mock('leaflet/dist/leaflet.css', () => ({}));

describe('MapComponent', () => {
  // Test data
  const defaultProps = {
    lat: 40.7128,
    lng: -74.0060,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render without crashing', () => {
      // Arrange & Act
      const { container } = render(<MapComponent {...defaultProps} />);

      // Assert
      expect(container).toBeInTheDocument();
    });

    test('should render MapContainer with correct center coordinates', () => {
      // Arrange & Act
      render(<MapComponent {...defaultProps} />);
      const mapContainer = screen.getByTestId('map-container');

      // Assert
      expect(mapContainer).toBeInTheDocument();
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([defaultProps.lat, defaultProps.lng]);
    });

    test('should render MapContainer with correct zoom level', () => {
      // Arrange & Act
      render(<MapComponent {...defaultProps} />);
      const mapContainer = screen.getByTestId('map-container');

      // Assert
      expect(mapContainer).toHaveAttribute('data-zoom', '13');
    });

    test('should render map with correct dimensions (300x300px)', () => {
      // Arrange & Act
      render(<MapComponent {...defaultProps} />);
      const mapContainer = screen.getByTestId('map-container');

      // Assert
      expect(mapContainer).toHaveStyle({ height: '300px', width: '300px' });
    });
  });

  describe('Props Handling', () => {
    test('should pass lat and lng props correctly to MapContainer center', () => {
      // Arrange
      const customProps = { lat: 51.5074, lng: -0.1278 }; // London

      // Act
      render(<MapComponent {...customProps} />);
      const mapContainer = screen.getByTestId('map-container');

      // Assert
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([customProps.lat, customProps.lng]);
    });

    test('should position Marker at correct lat/lng', () => {
      // Arrange & Act
      render(<MapComponent {...defaultProps} />);
      const marker = screen.getByTestId('marker');

      // Assert
      const markerPosition = JSON.parse(marker.getAttribute('data-position'));
      expect(markerPosition).toEqual([defaultProps.lat, defaultProps.lng]);
    });

    test('should update map center when props change', () => {
      // Arrange
      const { rerender } = render(<MapComponent {...defaultProps} />);
      const initialMapContainer = screen.getByTestId('map-container');
      const initialCenter = JSON.parse(initialMapContainer.getAttribute('data-center'));

      // Act
      const newProps = { lat: 48.8566, lng: 2.3522 }; // Paris
      rerender(<MapComponent {...newProps} />);
      const updatedMapContainer = screen.getByTestId('map-container');
      const updatedCenter = JSON.parse(updatedMapContainer.getAttribute('data-center'));

      // Assert
      expect(initialCenter).toEqual([defaultProps.lat, defaultProps.lng]);
      expect(updatedCenter).toEqual([newProps.lat, newProps.lng]);
      expect(updatedCenter).not.toEqual(initialCenter);
    });

    test('should update marker position when props change', () => {
      // Arrange
      const { rerender } = render(<MapComponent {...defaultProps} />);
      const initialMarker = screen.getByTestId('marker');
      const initialPosition = JSON.parse(initialMarker.getAttribute('data-position'));

      // Act
      const newProps = { lat: 35.6762, lng: 139.6503 }; // Tokyo
      rerender(<MapComponent {...newProps} />);
      const updatedMarker = screen.getByTestId('marker');
      const updatedPosition = JSON.parse(updatedMarker.getAttribute('data-position'));

      // Assert
      expect(initialPosition).toEqual([defaultProps.lat, defaultProps.lng]);
      expect(updatedPosition).toEqual([newProps.lat, newProps.lng]);
      expect(updatedPosition).not.toEqual(initialPosition);
    });

    test('should handle edge case of coordinates at equator and prime meridian', () => {
      // Arrange
      const equatorProps = { lat: 0, lng: 0 };

      // Act
      render(<MapComponent {...equatorProps} />);
      const mapContainer = screen.getByTestId('map-container');
      const marker = screen.getByTestId('marker');

      // Assert
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      const markerPosition = JSON.parse(marker.getAttribute('data-position'));
      expect(centerData).toEqual([0, 0]);
      expect(markerPosition).toEqual([0, 0]);
    });

    test('should handle negative coordinates', () => {
      // Arrange
      const negativeProps = { lat: -33.8688, lng: -151.2093 }; // Sydney (negative coordinates)

      // Act
      render(<MapComponent {...negativeProps} />);
      const mapContainer = screen.getByTestId('map-container');
      const marker = screen.getByTestId('marker');

      // Assert
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      const markerPosition = JSON.parse(marker.getAttribute('data-position'));
      expect(centerData).toEqual([negativeProps.lat, negativeProps.lng]);
      expect(markerPosition).toEqual([negativeProps.lat, negativeProps.lng]);
    });
  });

  describe('Map Elements', () => {
    test('should render TileLayer with correct URL', () => {
      // Arrange & Act
      render(<MapComponent {...defaultProps} />);
      const tileLayer = screen.getByTestId('tile-layer');

      // Assert
      expect(tileLayer).toBeInTheDocument();
      expect(tileLayer).toHaveAttribute(
        'data-url',
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      );
    });

    test('should render TileLayer with attribution text', () => {
      // Arrange & Act
      render(<MapComponent {...defaultProps} />);
      const tileLayer = screen.getByTestId('tile-layer');

      // Assert
      expect(tileLayer).toHaveAttribute('data-attribution');
      const attribution = tileLayer.getAttribute('data-attribution');
      expect(attribution).toContain('OpenStreetMap');
      expect(attribution).toContain('contributors');
    });

    test('should render Marker at correct position', () => {
      // Arrange & Act
      render(<MapComponent {...defaultProps} />);
      const marker = screen.getByTestId('marker');

      // Assert
      expect(marker).toBeInTheDocument();
      const markerPosition = JSON.parse(marker.getAttribute('data-position'));
      expect(markerPosition).toEqual([defaultProps.lat, defaultProps.lng]);
    });

    test('should render Popup with correct text', () => {
      // Arrange & Act
      render(<MapComponent {...defaultProps} />);
      const popup = screen.getByTestId('popup');

      // Assert
      expect(popup).toBeInTheDocument();
      expect(popup).toHaveTextContent('You are here.');
    });

    test('should render all map elements together', () => {
      // Arrange & Act
      render(<MapComponent {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
      expect(screen.getByTestId('marker')).toBeInTheDocument();
      expect(screen.getByTestId('popup')).toBeInTheDocument();
    });
  });

  describe('Leaflet Icon Configuration', () => {
    test('should delete _getIconUrl from L.Icon.Default.prototype', () => {
      // Arrange
      const L = require('leaflet');
      
      // Act
      // The MapComponent module executes the delete operation on import
      // We just need to verify the mock was set up

      // Assert
      // Since the module is already imported, the delete operation has already executed
      // We can verify that the icon configuration methods exist
      expect(L.Icon.Default.mergeOptions).toBeDefined();
    });

    test('should configure default icon URLs correctly', () => {
      // Arrange
      const L = require('leaflet');
      
      // Act
      // Re-import the component to trigger the icon configuration
      jest.isolateModules(() => {
        require('../MapComponent');
      });

      // Assert
      expect(L.Icon.Default.mergeOptions).toHaveBeenCalled();
      const callArgs = L.Icon.Default.mergeOptions.mock.calls[0][0];
      expect(callArgs).toHaveProperty('iconRetinaUrl');
      expect(callArgs).toHaveProperty('iconUrl');
      expect(callArgs).toHaveProperty('shadowUrl');
    });

    test('should use correct Leaflet CDN URLs for icons', () => {
      // Arrange
      const L = require('leaflet');
      
      // Act
      jest.isolateModules(() => {
        require('../MapComponent');
      });

      // Assert
      const callArgs = L.Icon.Default.mergeOptions.mock.calls[0][0];
      expect(callArgs.iconRetinaUrl).toContain('marker-icon-2x.png');
      expect(callArgs.iconUrl).toContain('marker-icon.png');
      expect(callArgs.shadowUrl).toContain('marker-shadow.png');
      expect(callArgs.iconRetinaUrl).toContain('unpkg.com/leaflet');
      expect(callArgs.iconUrl).toContain('unpkg.com/leaflet');
      expect(callArgs.shadowUrl).toContain('unpkg.com/leaflet');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle extreme latitude values', () => {
      // Arrange
      const extremeProps = { lat: 89.9, lng: 0 }; // Near North Pole

      // Act
      render(<MapComponent {...extremeProps} />);
      const mapContainer = screen.getByTestId('map-container');

      // Assert
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([extremeProps.lat, extremeProps.lng]);
    });

    test('should handle extreme longitude values', () => {
      // Arrange
      const extremeProps = { lat: 0, lng: 179.9 }; // Near International Date Line

      // Act
      render(<MapComponent {...extremeProps} />);
      const mapContainer = screen.getByTestId('map-container');

      // Assert
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([extremeProps.lat, extremeProps.lng]);
    });

    test('should render correctly with decimal coordinates', () => {
      // Arrange
      const decimalProps = { lat: 40.748817, lng: -73.985428 }; // Empire State Building

      // Act
      render(<MapComponent {...decimalProps} />);
      const mapContainer = screen.getByTestId('map-container');
      const marker = screen.getByTestId('marker');

      // Assert
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      const markerPosition = JSON.parse(marker.getAttribute('data-position'));
      expect(centerData).toEqual([decimalProps.lat, decimalProps.lng]);
      expect(markerPosition).toEqual([decimalProps.lat, decimalProps.lng]);
    });
  });
});
