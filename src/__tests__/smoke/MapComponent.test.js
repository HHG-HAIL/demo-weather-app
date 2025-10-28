import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapComponent from '../../MapComponent';

// Mock react-leaflet components to avoid DOM/canvas issues in test environment
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: (props) => <div data-testid="tile-layer" {...props} />,
  Marker: ({ children, ...props }) => (
    <div data-testid="marker" {...props}>
      {children}
    </div>
  ),
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
}));

// Mock leaflet to avoid issues with default icon setup
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

describe('MapComponent - Smoke Tests', () => {
  test('renders without crashing with valid coordinates', () => {
    const { container } = render(<MapComponent lat={40.7128} lng={-74.0060} />);
    expect(container).toBeInTheDocument();
  });

  test('renders map container', () => {
    render(<MapComponent lat={40.7128} lng={-74.0060} />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  test('renders tile layer', () => {
    render(<MapComponent lat={40.7128} lng={-74.0060} />);
    const tileLayer = screen.getByTestId('tile-layer');
    expect(tileLayer).toBeInTheDocument();
  });

  test('renders marker', () => {
    render(<MapComponent lat={40.7128} lng={-74.0060} />);
    const marker = screen.getByTestId('marker');
    expect(marker).toBeInTheDocument();
  });

  test('renders popup with text', () => {
    render(<MapComponent lat={40.7128} lng={-74.0060} />);
    const popup = screen.getByTestId('popup');
    expect(popup).toBeInTheDocument();
    expect(popup).toHaveTextContent('You are here.');
  });

  test('handles prop changes without crashing', () => {
    const { rerender } = render(<MapComponent lat={40.7128} lng={-74.0060} />);
    
    // Rerender with different coordinates
    rerender(<MapComponent lat={51.5074} lng={-0.1278} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  test('renders with different coordinate sets', () => {
    const coordinates = [
      { lat: 40.7128, lng: -74.0060 }, // New York
      { lat: 51.5074, lng: -0.1278 },  // London
      { lat: 35.6762, lng: 139.6503 }, // Tokyo
      { lat: 0, lng: 0 },              // Null Island
    ];

    coordinates.forEach(({ lat, lng }) => {
      const { unmount } = render(<MapComponent lat={lat} lng={lng} />);
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
      unmount();
    });
  });

  test('no console errors when rendering with mocks', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    render(<MapComponent lat={40.7128} lng={-74.0060} />);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
