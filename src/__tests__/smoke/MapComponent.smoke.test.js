import React from 'react';
import { render } from '@testing-library/react';
import MapComponent from '../../MapComponent';

describe('MapComponent - Smoke Tests', () => {
  // Mock console.error to check for errors
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('Map component renders with valid coordinates', () => {
    const { container } = render(<MapComponent lat={40.7128} lng={-74.0060} />);
    expect(container.querySelector('[data-testid="map-container"]')).toBeInTheDocument();
  });

  test('No console errors on render', () => {
    render(<MapComponent lat={40.7128} lng={-74.0060} />);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('Map component renders with different coordinates', () => {
    const { container } = render(<MapComponent lat={51.5074} lng={-0.1278} />);
    expect(container.querySelector('[data-testid="map-container"]')).toBeInTheDocument();
  });

  test('Map components are present', () => {
    const { container } = render(<MapComponent lat={37.7749} lng={-122.4194} />);
    expect(container.querySelector('[data-testid="map-container"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="tile-layer"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="marker"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="popup"]')).toBeInTheDocument();
  });
});
