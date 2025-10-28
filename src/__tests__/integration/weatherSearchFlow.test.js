import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { server } from '../integration-test-mocks/server';
import { rest } from 'msw';
import { mockWeatherData } from '../integration-test-mocks/handlers';

// Mock the MapComponent to avoid issues with react-leaflet in tests
jest.mock('../../MapComponent', () => {
  return function MockMapComponent() {
    return <div data-testid="mock-map">Map Component</div>;
  };
});

describe('Weather Search Flow - API Integration', () => {
  
  describe('1. Successful Weather Search', () => {
    test('should display weather data after successful search for London', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByRole('button', { name: /search/i });

      // Act - User types "London" in search input
      await userEvent.type(searchInput, 'London');
      expect(searchInput).toHaveValue('London');

      // Act - User presses Enter
      await userEvent.keyboard('{Enter}');

      // Assert - Verify loading spinner shows
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

      // Assert - Wait for loading to complete and verify weather data displays
      await waitFor(() => {
        expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Assert - Verify weather data displays correctly
      await waitFor(() => {
        // Location name
        expect(screen.getByText('London')).toBeInTheDocument();
        
        // Temperature (15°C from mock data)
        expect(screen.getByText(/15°C/i)).toBeInTheDocument();
        
        // Weather description
        expect(screen.getByText('Clear')).toBeInTheDocument();
        
        // Humidity
        expect(screen.getByText('65%')).toBeInTheDocument();
        
        // Wind speed (4.5 m/s rounded to 5)
        expect(screen.getByText(/5m\/s/i)).toBeInTheDocument();
        
        // Max temperature (18°C)
        expect(screen.getByText(/18°C/i)).toBeInTheDocument();
        
        // Feels like temperature (14°C)
        expect(screen.getByText(/14°C/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should clear search input after successful search', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      // Act
      await userEvent.type(searchInput, 'London');
      await userEvent.keyboard('{Enter}');
      
      // Assert - Wait for search to complete and input to clear
      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      }, { timeout: 5000 });
    });
  });

  describe('2. Failed Weather Search - Invalid Location', () => {
    test('should display error alert for invalid city', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByRole('button', { name: /search/i });

      // Act - User types "InvalidCity123" in search input
      await userEvent.type(searchInput, 'InvalidCity123');
      
      // Act - User clicks Search button
      await userEvent.click(searchButton);

      // Assert - Verify loading spinner shows
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

      // Assert - Wait for API call to complete and error to appear
      await waitFor(() => {
        expect(screen.getByText('city not found')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Assert - Verify no weather data displays
      expect(screen.queryByText('InvalidCity123')).not.toBeInTheDocument();
      
      // Assert - Verify loading spinner disappears
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    test('should auto-dismiss error after 3 seconds', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      // Act
      await userEvent.type(searchInput, 'InvalidCity123');
      await userEvent.keyboard('{Enter}');
      
      // Assert - Error appears
      await waitFor(() => {
        expect(screen.getByText('city not found')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Assert - Error auto-dismisses after 3 seconds
      await waitFor(() => {
        expect(screen.queryByText('city not found')).not.toBeInTheDocument();
      }, { timeout: 4000 });
    });

    test('should allow manual dismissal of error', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      // Act
      await userEvent.type(searchInput, 'InvalidCity123');
      await userEvent.keyboard('{Enter}');
      
      // Assert - Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('city not found')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Act - Click close button
      const closeButton = screen.getByRole('button', { name: /✖/i });
      await userEvent.click(closeButton);
      
      // Assert - Error is dismissed immediately
      expect(screen.queryByText('city not found')).not.toBeInTheDocument();
    });
  });

  describe('3. Unit Toggle After Search', () => {
    test('should display temperature with °C symbol initially', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      // Act - Perform successful weather search (Celsius)
      await userEvent.type(searchInput, 'London');
      await userEvent.keyboard('{Enter}');
      
      // Assert - Verify temperature displays with °C
      await waitFor(() => {
        expect(screen.getByText(/15°C/i)).toBeInTheDocument();
        expect(screen.getByText(/14°C/i)).toBeInTheDocument(); // feels like
        expect(screen.getByText(/18°C/i)).toBeInTheDocument(); // max temp
      }, { timeout: 5000 });
    });

    test('should clear data when unit is changed to Fahrenheit', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      // Act - Perform successful weather search (Celsius)
      await userEvent.type(searchInput, 'London');
      await userEvent.keyboard('{Enter}');
      
      // Wait for weather data to appear
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Act - Change unit to Fahrenheit using the dropdown
      // Find the select control and click it
      const selectControl = screen.getByText('Celsius (°C)');
      await userEvent.click(selectControl);
      
      // Click on Fahrenheit option
      const fahrenheitOption = await screen.findByText('Fahrenheit (°F)');
      await userEvent.click(fahrenheitOption);
      
      // Assert - Verify data is cleared (requires new search)
      await waitFor(() => {
        expect(screen.queryByText('London')).not.toBeInTheDocument();
      });
    });
  });

  describe('4. Multiple Consecutive Searches', () => {
    test('should replace London data with Paris data on consecutive searches', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      // Act - Search for "London"
      await userEvent.type(searchInput, 'London');
      await userEvent.keyboard('{Enter}');
      
      // Assert - Verify London weather displays
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
        expect(screen.getByText(/15°C/i)).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Act - Search for "Paris"
      await userEvent.type(searchInput, 'Paris');
      await userEvent.keyboard('{Enter}');
      
      // Assert - Verify Paris weather displays (London data replaced)
      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByText(/12°C/i)).toBeInTheDocument();
        expect(screen.getByText('Clouds')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Assert - Verify no duplicate data or London data
      expect(screen.queryByText('London')).not.toBeInTheDocument();
      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    test('should handle rapid consecutive searches without state issues', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      // Act - Rapidly search multiple times
      await userEvent.type(searchInput, 'London');
      await userEvent.keyboard('{Enter}');
      
      // Wait briefly and search again
      await new Promise(resolve => setTimeout(resolve, 500));
      await userEvent.type(searchInput, 'Paris');
      await userEvent.keyboard('{Enter}');
      
      // Assert - Final result should be Paris
      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('5. Search via Enter Key vs Button Click', () => {
    test('should trigger search using Enter key', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      // Act - Test search triggered by Enter key
      await userEvent.type(searchInput, 'London');
      await userEvent.keyboard('{Enter}');
      
      // Assert - Verify weather data displays
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
        expect(screen.getByText(/15°C/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should trigger search using button click', async () => {
      // Arrange
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      // Act - Test search triggered by button click
      await userEvent.type(searchInput, 'Paris');
      await userEvent.click(searchButton);
      
      // Assert - Verify weather data displays
      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByText(/12°C/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should produce identical results for Enter key and button click', async () => {
      // Arrange - First search using Enter key
      const { unmount } = render(<App />);
      let searchInput = screen.getByPlaceholderText('Search Location');
      
      await userEvent.type(searchInput, 'London');
      await userEvent.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      const enterKeyResult = screen.getByText('London').textContent;
      const enterKeyTemp = screen.getByText(/15°C/i).textContent;
      
      // Cleanup and re-render
      unmount();
      
      // Arrange - Second search using button click
      render(<App />);
      searchInput = screen.getByPlaceholderText('Search Location');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      await userEvent.type(searchInput, 'London');
      await userEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      const buttonClickResult = screen.getByText('London').textContent;
      const buttonClickTemp = screen.getByText(/15°C/i).textContent;
      
      // Assert - Both methods produce identical results
      expect(enterKeyResult).toBe(buttonClickResult);
      expect(enterKeyTemp).toBe(buttonClickTemp);
    });
  });

  describe('API Integration Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Arrange - Override handler to simulate network error
      server.use(
        rest.get('https://api.openweathermap.org/data/2.5/weather', (req, res, ctx) => {
          return res.networkError('Failed to connect');
        })
      );
      
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search Location');
      
      // Act
      await userEvent.type(searchInput, 'London');
      await userEvent.keyboard('{Enter}');
      
      // Assert - Error message should appear
      await waitFor(() => {
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should handle empty search input gracefully', async () => {
      // Arrange
      render(<App />);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      // Act - Click search without entering location
      await userEvent.click(searchButton);
      
      // Assert - Should show error or no crash
      await waitFor(() => {
        // The app should handle this gracefully, either showing error or doing nothing
        expect(screen.getByPlaceholderText('Search Location')).toBeInTheDocument();
      });
    });
  });
});
