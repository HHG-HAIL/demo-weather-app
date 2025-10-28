import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock leaflet CSS first
jest.mock('leaflet/dist/leaflet.css', () => ({}));

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

// Import MapComponent after mocks are set up
import MapComponent from '../MapComponent';

describe('MapComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Basic Rendering', () => {
    it('should render MapComponent with provided lat/lng coordinates', () => {
      // Arrange
      const lat = 40.7128;
      const lng = -74.0060;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should initialize MapContainer with correct center position', () => {
      // Arrange
      const lat = 51.5074;
      const lng = -0.1278;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([lat, lng]);
    });

    it('should initialize MapContainer with correct zoom level (13)', () => {
      // Arrange
      const lat = 48.8566;
      const lng = 2.3522;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer.getAttribute('data-zoom')).toBe('13');
    });

    it('should have correct style dimensions (300px x 300px)', () => {
      // Arrange
      const lat = 35.6762;
      const lng = 139.6503;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveStyle({
        height: '300px',
        width: '300px',
      });
    });
  });

  describe('Map Components - TileLayer', () => {
    it('should render TileLayer with OpenStreetMap URL', () => {
      // Arrange
      const lat = 37.7749;
      const lng = -122.4194;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const tileLayer = screen.getByTestId('tile-layer');
      expect(tileLayer).toBeInTheDocument();
      expect(tileLayer.getAttribute('data-url')).toBe(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      );
    });

    it('should render TileLayer with correct attribution', () => {
      // Arrange
      const lat = 37.7749;
      const lng = -122.4194;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const tileLayer = screen.getByTestId('tile-layer');
      expect(tileLayer.getAttribute('data-attribution')).toContain('OpenStreetMap');
    });
  });

  describe('Map Components - Marker and Popup', () => {
    it('should place Marker at correct position', () => {
      // Arrange
      const lat = 34.0522;
      const lng = -118.2437;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
      const positionData = JSON.parse(marker.getAttribute('data-position'));
      expect(positionData).toEqual([lat, lng]);
    });

    it('should render Popup inside Marker', () => {
      // Arrange
      const lat = 41.8781;
      const lng = -87.6298;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const popup = screen.getByTestId('popup');
      expect(popup).toBeInTheDocument();
    });

    it('should display correct text in Popup ("You are here.")', () => {
      // Arrange
      const lat = 29.7604;
      const lng = -95.3698;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const popup = screen.getByTestId('popup');
      expect(popup).toHaveTextContent('You are here.');
    });
  });

  describe('Edge Cases - Coordinate Values', () => {
    it('should handle zero coordinates (0, 0)', () => {
      // Arrange
      const lat = 0;
      const lng = 0;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([0, 0]);
      
      const marker = screen.getByTestId('marker');
      const positionData = JSON.parse(marker.getAttribute('data-position'));
      expect(positionData).toEqual([0, 0]);
    });

    it('should handle negative coordinates', () => {
      // Arrange
      const lat = -33.8688;
      const lng = -151.2093;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([lat, lng]);
    });

    it('should handle extreme latitude values (near poles)', () => {
      // Arrange
      const lat = 89.9;
      const lng = 180;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([lat, lng]);
    });

    it('should handle decimal coordinates with high precision', () => {
      // Arrange
      const lat = 40.712776;
      const lng = -74.005974;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      expect(centerData).toEqual([lat, lng]);
    });

    it('should render with undefined coordinates (edge case)', () => {
      // Arrange
      const lat = undefined;
      const lng = undefined;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should render with null coordinates (edge case)', () => {
      // Arrange
      const lat = null;
      const lng = null;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should handle string coordinates (invalid type)', () => {
      // Arrange
      const lat = '40.7128';
      const lng = '-74.0060';

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });
  });

  describe('Integration - All Components Together', () => {
    it('should render all map components (MapContainer, TileLayer, Marker, Popup) together', () => {
      // Arrange
      const lat = 52.5200;
      const lng = 13.4050;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
      expect(screen.getByTestId('marker')).toBeInTheDocument();
      expect(screen.getByTestId('popup')).toBeInTheDocument();
    });

    it('should maintain correct parent-child relationships', () => {
      // Arrange
      const lat = 55.7558;
      const lng = 37.6173;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      const tileLayer = screen.getByTestId('tile-layer');
      const marker = screen.getByTestId('marker');
      const popup = screen.getByTestId('popup');

      // Verify TileLayer and Marker are children of MapContainer
      expect(mapContainer).toContainElement(tileLayer);
      expect(mapContainer).toContainElement(marker);
      
      // Verify Popup is child of Marker
      expect(marker).toContainElement(popup);
    });
  });

  describe('Props Validation', () => {
    it('should pass correct props to MapContainer', () => {
      // Arrange
      const lat = 35.6895;
      const lng = 139.6917;

      // Act
      const { container } = render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer.getAttribute('data-center')).toBe(JSON.stringify([lat, lng]));
      expect(mapContainer.getAttribute('data-zoom')).toBe('13');
      expect(mapContainer.style.height).toBe('300px');
      expect(mapContainer.style.width).toBe('300px');
    });

    it('should pass correct position to Marker matching MapContainer center', () => {
      // Arrange
      const lat = 40.4168;
      const lng = -3.7038;

      // Act
      render(<MapComponent lat={lat} lng={lng} />);

      // Assert
      const mapContainer = screen.getByTestId('map-container');
      const marker = screen.getByTestId('marker');
      
      const centerData = JSON.parse(mapContainer.getAttribute('data-center'));
      const positionData = JSON.parse(marker.getAttribute('data-position'));
      
      expect(centerData).toEqual(positionData);
      expect(centerData).toEqual([lat, lng]);
    });
  });
});
