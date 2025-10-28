
# Simple Weather app using third party api.<br> 

Live Demo :  [weather-app](https://rdinesh1667.github.io/weather-app/) <br>

# UI View <br>
![Weather Report](https://raw.github.com/Rdinesh1667/weather-app/master/src/images/weather-app-1.png) <br>

# With Weather info <br>
![Weather Report](https://raw.github.com/Rdinesh1667/weather-app/master/src/images/weather-app-2.png) <br>

## Testing

### Smoke Tests
The project includes comprehensive smoke tests to verify critical user flows and ensure the application loads without crashing.

**Run smoke tests:**
```bash
npm test -- --testPathPattern=smoke
```

**Run all tests:**
```bash
npm test
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

### Test Structure
- **Location**: `src/__tests__/smoke/`
- **Framework**: Jest + @testing-library/react
- **Execution Time**: ~2 seconds
- **Total Tests**: 17 tests covering:
  - App component (9 tests)
  - Alert component (4 tests)
  - MapComponent (4 tests)

All smoke tests verify:
- Components render without crashing
- No console errors on render
- Critical UI elements are visible and accessible
