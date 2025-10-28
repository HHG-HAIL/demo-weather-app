import { rest } from 'msw';

const API_KEY = '21571e236ae1e7500c50aabca16ad13c';

// Mock weather data for successful responses
export const mockWeatherData = {
  london: {
    coord: { lon: -0.1257, lat: 51.5085 },
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }
    ],
    base: 'stations',
    main: {
      temp: 15,
      feels_like: 14,
      temp_min: 12,
      temp_max: 18,
      pressure: 1013,
      humidity: 65
    },
    visibility: 10000,
    wind: {
      speed: 4.5,
      deg: 220
    },
    clouds: { all: 0 },
    dt: 1609459200,
    sys: {
      type: 1,
      id: 1414,
      country: 'GB',
      sunrise: 1609401600,
      sunset: 1609430400
    },
    timezone: 0,
    id: 2643743,
    name: 'London',
    cod: 200
  },
  paris: {
    coord: { lon: 2.3488, lat: 48.8534 },
    weather: [
      {
        id: 801,
        main: 'Clouds',
        description: 'few clouds',
        icon: '02d'
      }
    ],
    base: 'stations',
    main: {
      temp: 12,
      feels_like: 11,
      temp_min: 10,
      temp_max: 14,
      pressure: 1015,
      humidity: 70
    },
    visibility: 10000,
    wind: {
      speed: 3.5,
      deg: 180
    },
    clouds: { all: 20 },
    dt: 1609459200,
    sys: {
      type: 1,
      id: 5615,
      country: 'FR',
      sunrise: 1609401600,
      sunset: 1609430400
    },
    timezone: 3600,
    id: 2988507,
    name: 'Paris',
    cod: 200
  }
};

// MSW handlers
export const handlers = [
  // Handler for successful weather request
  rest.get('https://api.openweathermap.org/data/2.5/weather', (req, res, ctx) => {
    const location = req.url.searchParams.get('q');
    const appid = req.url.searchParams.get('appid');
    const units = req.url.searchParams.get('units');

    // Check if API key is correct
    if (appid !== API_KEY) {
      return res(
        ctx.status(401),
        ctx.json({ cod: '401', message: 'Invalid API key' })
      );
    }

    // Return mock data based on location
    if (location?.toLowerCase() === 'london') {
      return res(ctx.status(200), ctx.json(mockWeatherData.london));
    }

    if (location?.toLowerCase() === 'paris') {
      return res(ctx.status(200), ctx.json(mockWeatherData.paris));
    }

    // Return 404 for invalid locations
    if (location?.toLowerCase() === 'invalidcity123') {
      return res(
        ctx.status(404),
        ctx.json({ cod: '404', message: 'city not found' })
      );
    }

    // Default 404 for unknown cities
    return res(
      ctx.status(404),
      ctx.json({ cod: '404', message: 'city not found' })
    );
  })
];
