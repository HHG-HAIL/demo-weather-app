import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('App Component - Smoke Tests', () => {
  // Mock console.error to check for errors
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('App renders without crashing', () => {
    render(<App />);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('Search input is visible', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/search location/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeVisible();
  });

  test('Search button is present', () => {
    render(<App />);
    const searchButton = screen.getByText(/search/i);
    expect(searchButton).toBeInTheDocument();
  });

  test('Date display is visible', () => {
    render(<App />);
    // The date component renders in a div with class "date" containing a <p> tag
    // Look for a date pattern that includes month name and day
    const datePattern = /\w+,\s+\w+\s+\d{1,2},\s+\d{4}/; // e.g., "Tuesday, October 28, 2025"
    const dateElements = screen.getAllByText(datePattern);
    // Find the one in the date display (should be in a <p> tag, not in footer)
    const dateElement = dateElements.find(el => el.tagName === 'P');
    expect(dateElement).toBeInTheDocument();
    expect(dateElement).toBeVisible();
  });

  test('Footer is rendered', () => {
    render(<App />);
    const footer = screen.getByText(/weather app. all rights reserved/i);
    expect(footer).toBeInTheDocument();
  });

  test('Unit dropdown is rendered', () => {
    render(<App />);
    // React-select renders with specific structure
    const unitDropdown = document.querySelector('.custom-select');
    expect(unitDropdown).toBeInTheDocument();
  });

  test('Open Map button is visible', () => {
    render(<App />);
    const mapButton = screen.getByText(/open map/i);
    expect(mapButton).toBeInTheDocument();
  });

  test('Default state is correct - no weather data initially', () => {
    render(<App />);
    // When there's no data, the temperature container should not be present
    const temperatureElements = screen.queryByText(/feels like/i);
    expect(temperatureElements).not.toBeInTheDocument();
  });

  test('No console errors on render', () => {
    render(<App />);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
