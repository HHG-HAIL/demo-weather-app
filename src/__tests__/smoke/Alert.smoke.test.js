import React from 'react';
import { render, screen } from '@testing-library/react';
import Alert from '../../Alert';

describe('Alert Component - Smoke Tests', () => {
  // Mock console.error to check for errors
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('Alert renders with basic props', () => {
    render(<Alert message="Test message" type="error" onClose={() => {}} />);
    const alertMessage = screen.getByText('Test message');
    expect(alertMessage).toBeInTheDocument();
  });

  test('No console errors on render', () => {
    render(<Alert message="Test alert" type="error" onClose={() => {}} />);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('Alert renders with different message types', () => {
    const { rerender } = render(
      <Alert message="Error message" type="error" onClose={() => {}} />
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();

    rerender(<Alert message="Success message" type="success" onClose={() => {}} />);
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  test('Close button is rendered', () => {
    render(<Alert message="Test" type="error" onClose={() => {}} />);
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });
});
