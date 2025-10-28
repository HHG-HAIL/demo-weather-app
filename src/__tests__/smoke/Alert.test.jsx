import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from '../../Alert';

describe('Alert Component - Smoke Tests', () => {
  test('renders without crashing with required props', () => {
    const mockOnClose = jest.fn();
    
    const { container } = render(
      <Alert 
        message="Test message" 
        type="error" 
        onClose={mockOnClose} 
      />
    );
    
    // Verify the alert div is rendered
    const alertDiv = container.querySelector('.alert');
    expect(alertDiv).toBeInTheDocument();
  });

  test('displays message text', () => {
    const mockOnClose = jest.fn();
    const testMessage = 'This is a test alert message';
    
    render(
      <Alert 
        message={testMessage} 
        type="error" 
        onClose={mockOnClose} 
      />
    );
    
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  test('close button is present', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Alert 
        message="Test message" 
        type="error" 
        onClose={mockOnClose} 
      />
    );
    
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveClass('close-button');
  });

  test('renders with error type', () => {
    const mockOnClose = jest.fn();
    
    const { container } = render(
      <Alert 
        message="Error message" 
        type="error" 
        onClose={mockOnClose} 
      />
    );
    
    const alertDiv = container.querySelector('.alert.error');
    expect(alertDiv).toBeInTheDocument();
  });

  test('renders with warning type', () => {
    const mockOnClose = jest.fn();
    
    const { container } = render(
      <Alert 
        message="Warning message" 
        type="warning" 
        onClose={mockOnClose} 
      />
    );
    
    const alertDiv = container.querySelector('.alert.warning');
    expect(alertDiv).toBeInTheDocument();
  });

  test('renders with success type', () => {
    const mockOnClose = jest.fn();
    
    const { container } = render(
      <Alert 
        message="Success message" 
        type="success" 
        onClose={mockOnClose} 
      />
    );
    
    const alertDiv = container.querySelector('.alert.success');
    expect(alertDiv).toBeInTheDocument();
  });

  test('renders with info type', () => {
    const mockOnClose = jest.fn();
    
    const { container } = render(
      <Alert 
        message="Info message" 
        type="info" 
        onClose={mockOnClose} 
      />
    );
    
    const alertDiv = container.querySelector('.alert.info');
    expect(alertDiv).toBeInTheDocument();
  });
});
