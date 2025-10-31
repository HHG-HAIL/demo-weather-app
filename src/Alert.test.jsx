import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from './Alert';

describe('Alert Component', () => {
  // Rendering Tests
  describe('Rendering', () => {
    test('renders component with message prop', () => {
      // Arrange
      const message = 'Test alert message';
      
      // Act
      render(<Alert message={message} type="error" onClose={() => {}} />);
      
      // Assert
      const alertElement = screen.getByText(message);
      expect(alertElement).toBeInTheDocument();
    });

    test('displays correct message text', () => {
      // Arrange
      const expectedMessage = 'This is an important alert';
      
      // Act
      render(<Alert message={expectedMessage} type="success" onClose={() => {}} />);
      
      // Assert
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    });

    test('applies correct CSS class for error type', () => {
      // Arrange
      const message = 'Error message';
      
      // Act
      const { container } = render(<Alert message={message} type="error" onClose={() => {}} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert.error');
      expect(alertDiv).toBeInTheDocument();
    });

    test('applies correct CSS class for success type', () => {
      // Arrange
      const message = 'Success message';
      
      // Act
      const { container } = render(<Alert message={message} type="success" onClose={() => {}} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert.success');
      expect(alertDiv).toBeInTheDocument();
    });

    test('applies correct CSS class for warning type', () => {
      // Arrange
      const message = 'Warning message';
      
      // Act
      const { container } = render(<Alert message={message} type="warning" onClose={() => {}} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert.warning');
      expect(alertDiv).toBeInTheDocument();
    });

    test('close button displays correctly', () => {
      // Arrange
      const message = 'Test message';
      
      // Act
      render(<Alert message={message} type="error" onClose={() => {}} />);
      
      // Assert
      const closeButton = screen.getByRole('button', { name: /✖/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('close-button');
    });
  });

  // Interaction Tests
  describe('Interactions', () => {
    test('close button calls onClose callback when clicked', () => {
      // Arrange
      const mockOnClose = jest.fn();
      const message = 'Test message';
      render(<Alert message={message} type="error" onClose={mockOnClose} />);
      
      // Act
      const closeButton = screen.getByRole('button', { name: /✖/i });
      fireEvent.click(closeButton);
      
      // Assert
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('close button can be clicked multiple times', () => {
      // Arrange
      const mockOnClose = jest.fn();
      const message = 'Test message';
      render(<Alert message={message} type="success" onClose={mockOnClose} />);
      
      // Act
      const closeButton = screen.getByRole('button', { name: /✖/i });
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      
      // Assert
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    test('handles empty message gracefully', () => {
      // Arrange & Act
      const { container } = render(<Alert message="" type="error" onClose={() => {}} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toBeInTheDocument();
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveTextContent('');
    });

    test('handles undefined message gracefully', () => {
      // Arrange & Act
      const { container } = render(<Alert message={undefined} type="error" onClose={() => {}} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toBeInTheDocument();
    });

    test('handles missing onClose callback without crashing', () => {
      // Arrange
      const message = 'Test message';
      
      // Act
      const { container } = render(<Alert message={message} type="error" onClose={undefined} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toBeInTheDocument();
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    test('handles null onClose callback without crashing', () => {
      // Arrange
      const message = 'Test message';
      
      // Act
      const { container } = render(<Alert message={message} type="error" onClose={null} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toBeInTheDocument();
    });

    test('handles different alert types correctly', () => {
      // Arrange
      const message = 'Multi-type test';
      const types = ['error', 'success', 'warning', 'info'];
      
      types.forEach(type => {
        // Act
        const { container } = render(<Alert message={message} type={type} onClose={() => {}} />);
        
        // Assert
        const alertDiv = container.querySelector(`.alert.${type}`);
        expect(alertDiv).toBeInTheDocument();
      });
    });

    test('handles undefined type prop', () => {
      // Arrange
      const message = 'Test message';
      
      // Act
      const { container } = render(<Alert message={message} type={undefined} onClose={() => {}} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toBeInTheDocument();
    });

    test('renders with all props provided', () => {
      // Arrange
      const message = 'Complete test';
      const mockOnClose = jest.fn();
      const type = 'error';
      
      // Act
      const { container } = render(<Alert message={message} type={type} onClose={mockOnClose} />);
      
      // Assert
      expect(screen.getByText(message)).toBeInTheDocument();
      expect(container.querySelector('.alert.error')).toBeInTheDocument();
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      
      // Act - click the button
      fireEvent.click(closeButton);
      
      // Assert
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // Additional Coverage Tests
  describe('Component Structure', () => {
    test('has correct HTML structure', () => {
      // Arrange
      const message = 'Structure test';
      
      // Act
      const { container } = render(<Alert message={message} type="error" onClose={() => {}} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toBeInTheDocument();
      
      const paragraph = alertDiv.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveTextContent(message);
      
      const button = alertDiv.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('close-button');
    });

    test('applies both alert and type classes', () => {
      // Arrange
      const message = 'Class test';
      
      // Act
      const { container } = render(<Alert message={message} type="warning" onClose={() => {}} />);
      
      // Assert
      const alertDiv = container.querySelector('div');
      expect(alertDiv).toHaveClass('alert');
      expect(alertDiv).toHaveClass('warning');
    });
  });
});
