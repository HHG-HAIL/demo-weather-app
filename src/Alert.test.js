import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from './Alert';

describe('Alert Component', () => {
  // AAA Pattern: Arrange-Act-Assert

  describe('Rendering Tests', () => {
    test('renders with correct message', () => {
      // Arrange
      const message = 'Test alert message';
      const mockOnClose = jest.fn();

      // Act
      render(<Alert message={message} type="error" onClose={mockOnClose} />);

      // Assert
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    test('renders with correct type/class', () => {
      // Arrange
      const message = 'Error message';
      const type = 'error';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type={type} onClose={mockOnClose} />
      );

      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toHaveClass('alert', type);
    });

    test('renders close button', () => {
      // Arrange
      const message = 'Test message';
      const mockOnClose = jest.fn();

      // Act
      render(<Alert message={message} type="error" onClose={mockOnClose} />);

      // Assert
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('close-button');
    });

    test('displays different alert types correctly - error', () => {
      // Arrange
      const message = 'Error occurred';
      const type = 'error';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type={type} onClose={mockOnClose} />
      );

      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toHaveClass('error');
    });

    test('displays different alert types correctly - success', () => {
      // Arrange
      const message = 'Success!';
      const type = 'success';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type={type} onClose={mockOnClose} />
      );

      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toHaveClass('success');
    });

    test('displays different alert types correctly - warning', () => {
      // Arrange
      const message = 'Warning!';
      const type = 'warning';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type={type} onClose={mockOnClose} />
      );

      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toHaveClass('warning');
    });

    test('displays different alert types correctly - info', () => {
      // Arrange
      const message = 'Information';
      const type = 'info';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type={type} onClose={mockOnClose} />
      );

      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toHaveClass('info');
    });
  });

  describe('Interaction Tests', () => {
    test('close button is clickable', () => {
      // Arrange
      const message = 'Clickable test';
      const mockOnClose = jest.fn();

      // Act
      render(<Alert message={message} type="error" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button');
      
      // Assert - button should be enabled and clickable
      expect(closeButton).toBeEnabled();
    });

    test('onClose callback is triggered when close button is clicked', () => {
      // Arrange
      const message = 'Callback test';
      const mockOnClose = jest.fn();

      // Act
      render(<Alert message={message} type="error" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      // Assert
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('onClose callback is triggered multiple times when close button is clicked multiple times', () => {
      // Arrange
      const message = 'Multiple clicks test';
      const mockOnClose = jest.fn();

      // Act
      render(<Alert message={message} type="error" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      // Assert
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('renders with empty message', () => {
      // Arrange
      const message = '';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(<Alert message={message} type="error" onClose={mockOnClose} />);

      // Assert
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.textContent).toBe('');
    });

    test('renders with undefined type', () => {
      // Arrange
      const message = 'Test message';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type={undefined} onClose={mockOnClose} />
      );

      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toBeInTheDocument();
      expect(alertDiv).toHaveClass('alert');
    });

    test('renders with null type', () => {
      // Arrange
      const message = 'Test message';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type={null} onClose={mockOnClose} />
      );

      // Assert
      const alertDiv = container.querySelector('.alert');
      expect(alertDiv).toBeInTheDocument();
    });

    test('renders with long message', () => {
      // Arrange
      const baseMessage = 'This is a very long message that should still be displayed correctly in the alert component without any issues. ';
      const longMessage = baseMessage.repeat(5);
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(<Alert message={longMessage} type="error" onClose={mockOnClose} />);

      // Assert
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.textContent).toBe(longMessage);
    });

    test('renders with special characters in message', () => {
      // Arrange
      const message = '<script>alert("XSS")</script>';
      const mockOnClose = jest.fn();

      // Act
      render(<Alert message={message} type="error" onClose={mockOnClose} />);

      // Assert
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    test('renders with numeric message', () => {
      // Arrange
      const message = 12345;
      const mockOnClose = jest.fn();

      // Act
      render(<Alert message={message} type="error" onClose={mockOnClose} />);

      // Assert
      expect(screen.getByText('12345')).toBeInTheDocument();
    });

    test('close button works without onClose callback', () => {
      // Arrange
      const message = 'No callback test';

      // Act & Assert - should not throw error
      expect(() => {
        render(<Alert message={message} type="error" onClose={undefined} />);
        const closeButton = screen.getByRole('button');
        fireEvent.click(closeButton);
      }).not.toThrow();
    });
  });

  describe('Snapshot Tests', () => {
    test('matches snapshot for error alert', () => {
      // Arrange
      const message = 'Error message';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type="error" onClose={mockOnClose} />
      );

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('matches snapshot for success alert', () => {
      // Arrange
      const message = 'Success message';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type="success" onClose={mockOnClose} />
      );

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('DOM Structure Tests', () => {
    test('alert container has correct structure', () => {
      // Arrange
      const message = 'Structure test';
      const mockOnClose = jest.fn();

      // Act
      const { container } = render(
        <Alert message={message} type="error" onClose={mockOnClose} />
      );

      // Assert
      const alertDiv = container.querySelector('.alert');
      const paragraph = alertDiv.querySelector('p');
      const button = alertDiv.querySelector('.close-button');

      expect(alertDiv).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    test('close button contains correct icon/text', () => {
      // Arrange
      const message = 'Icon test';
      const mockOnClose = jest.fn();

      // Act
      render(<Alert message={message} type="error" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button');

      // Assert
      // The close button contains the × character (HTML entity &#10006;)
      expect(closeButton.textContent).toBe('✖');
    });
  });
});
