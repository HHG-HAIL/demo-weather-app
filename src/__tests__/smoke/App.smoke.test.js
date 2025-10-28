import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';

// Mock axios to prevent actual API calls during smoke tests
jest.mock('axios');

import App from '../../App';

// Mock react-loader-spinner to avoid rendering issues
jest.mock('react-loader-spinner', () => ({
  MagnifyingGlass: () => <div data-testid="loading-spinner">Loading...</div>
}));

// Mock react-awesome-button to simplify rendering
jest.mock('react-awesome-button', () => ({
  AwesomeButton: ({ children, onPress, ...props }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  )
}));

// Mock MapComponent to avoid leaflet rendering issues in tests
jest.mock('../../MapComponent', () => {
  return function MockMapComponent() {
    return <div data-testid="map-component">Map</div>;
  };
});

// Mock react-select for simplicity in tests
jest.mock('react-select', () => {
  return function MockSelect({ options, value, onChange }) {
    return (
      <select
        data-testid="unit-dropdown"
        value={value?.value}
        onChange={(e) => {
          const selected = options.find(opt => opt.value === e.target.value);
          onChange(selected);
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };
});

describe('App Smoke Tests', () => {
  // Suppress console errors during tests
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = jest.fn();
  });

  beforeEach(() => {
    // Reset and configure axios mock before each test
    axios.get.mockClear();
    axios.get.mockResolvedValue({ data: {} });
  });

  afterAll(() => {
    console.error = originalError;
  });

  test('App renders without crashing', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Search Location')).toBeInTheDocument();
  });

  test('Search input field is present in the DOM', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText('Search Location');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  test('Search button is present in the DOM', () => {
    render(<App />);
    const searchButton = screen.getByText('Search');
    expect(searchButton).toBeInTheDocument();
  });

  test('Date display is present in the DOM', () => {
    render(<App />);
    const currentDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    expect(screen.getByText(currentDate)).toBeInTheDocument();
  });

  test('Unit dropdown selector is present in the DOM', () => {
    render(<App />);
    const dropdown = screen.getByTestId('unit-dropdown');
    expect(dropdown).toBeInTheDocument();
  });

  test('Map toggle button is present in the DOM', () => {
    render(<App />);
    const mapButton = screen.getByText('Open Map');
    expect(mapButton).toBeInTheDocument();
  });

  test('Footer is present in the DOM', () => {
    render(<App />);
    const currentYear = new Date().getFullYear();
    const footer = screen.getByText(`© ${currentYear} Weather app. All rights reserved.`);
    expect(footer).toBeInTheDocument();
  });

  test('Search input accepts text', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText('Search Location');
    
    fireEvent.change(searchInput, { target: { value: 'London' } });
    expect(searchInput.value).toBe('London');
  });

  test('Search button is clickable', async () => {
    render(<App />);
    
    // Add a location value first
    const searchInput = screen.getByPlaceholderText('Search Location');
    fireEvent.change(searchInput, { target: { value: 'London' } });
    
    const searchButton = screen.getByText('Search');
    
    // Should not throw error when clicked
    fireEvent.click(searchButton);
    
    // Wait for any async operations to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('Map toggle button is clickable', () => {
    render(<App />);
    const mapButton = screen.getByText('Open Map');
    
    // Should not throw error when clicked
    expect(() => fireEvent.click(mapButton)).not.toThrow();
  });

  test('Unit dropdown is functional', () => {
    render(<App />);
    const dropdown = screen.getByTestId('unit-dropdown');
    
    // Should be able to change the value
    expect(() => fireEvent.change(dropdown, { target: { value: 'imperial' } })).not.toThrow();
  });

  test('No critical console errors on initial load', () => {
    // Reset mock before test
    console.error.mockClear();
    
    render(<App />);
    
    // Filter out non-critical warnings (e.g., React warnings about act())
    const criticalErrors = console.error.mock.calls.filter(call => {
      const message = call[0]?.toString() || '';
      return !message.includes('act(') && 
             !message.includes('Warning:') &&
             !message.includes('Not implemented: HTMLFormElement.prototype.submit');
    });
    
    expect(criticalErrors.length).toBe(0);
  });

  test('All critical UI elements are present together', () => {
    render(<App />);
    
    // Verify all critical elements exist at once
    expect(screen.getByPlaceholderText('Search Location')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByTestId('unit-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Open Map')).toBeInTheDocument();
    
    const currentDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    expect(screen.getByText(currentDate)).toBeInTheDocument();
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Weather app. All rights reserved.`)).toBeInTheDocument();
  });
});
