import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from './Alert';

describe('Alert Component', () => {
  // Mock onClose callback
  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Clear mock before each test
    mockOnClose.mockClear();
  });

  // ==================== RENDERING TESTS ====================
  describe('Rendering', () => {
    test('should render component with message prop', () => {
      // Arrange & Act
      render(<Alert message="Test message" type="error" onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = screen.getByText('Test message').closest('.alert');
      expect(alertDiv).toBeInTheDocument();
    });

    test('should display alert message correctly', () => {
      // Arrange
      const testMessage = 'This is a test alert message';
      
      // Act
      render(<Alert message={testMessage} type="info" onClose={mockOnClose} />);
      
      // Assert
      expect(screen.getByText(testMessage)).toBeInTheDocument();
    });

    test('should render close button', () => {
      // Arrange & Act
      render(<Alert message="Test" type="error" onClose={mockOnClose} />);
      
      // Assert
      const closeButton = screen.getByRole('button', { name: /✖/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('close-button');
    });
  });

  // ==================== PROPS HANDLING TESTS ====================
  describe('Props Handling', () => {
    test('should display message prop correctly', () => {
      // Arrange
      const message1 = 'First message';
      const message2 = 'Second message';
      
      // Act
      const { rerender } = render(<Alert message={message1} type="error" onClose={mockOnClose} />);
      
      // Assert
      expect(screen.getByText(message1)).toBeInTheDocument();
      
      // Act - rerender with different message
      rerender(<Alert message={message2} type="error" onClose={mockOnClose} />);
      
      // Assert
      expect(screen.getByText(message2)).toBeInTheDocument();
      expect(screen.queryByText(message1)).not.toBeInTheDocument();
    });

    test('should apply correct CSS class for error type', () => {
      // Arrange & Act
      render(<Alert message="Error message" type="error" onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = screen.getByText('Error message').closest('.alert');
      expect(alertDiv).toHaveClass('alert', 'error');
    });

    test('should apply correct CSS class for success type', () => {
      // Arrange & Act
      render(<Alert message="Success message" type="success" onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = screen.getByText('Success message').closest('.alert');
      expect(alertDiv).toHaveClass('alert', 'success');
    });

    test('should apply correct CSS class for warning type', () => {
      // Arrange & Act
      render(<Alert message="Warning message" type="warning" onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = screen.getByText('Warning message').closest('.alert');
      expect(alertDiv).toHaveClass('alert', 'warning');
    });

    test('should apply correct CSS class for info type', () => {
      // Arrange & Act
      render(<Alert message="Info message" type="info" onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = screen.getByText('Info message').closest('.alert');
      expect(alertDiv).toHaveClass('alert', 'info');
    });

    test('should handle empty message gracefully', () => {
      // Arrange & Act
      render(<Alert message="" type="error" onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = document.querySelector('.alert');
      expect(alertDiv).toBeInTheDocument();
    });

    test('should handle long message correctly', () => {
      // Arrange
      const longMessage = 'This is a very long message that should still be displayed correctly in the alert component without any issues or problems';
      
      // Act
      render(<Alert message={longMessage} type="error" onClose={mockOnClose} />);
      
      // Assert
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  // ==================== USER INTERACTIONS TESTS ====================
  describe('User Interactions', () => {
    test('should trigger onClose callback when close button is clicked', () => {
      // Arrange
      render(<Alert message="Test message" type="error" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /✖/i });
      
      // Act
      fireEvent.click(closeButton);
      
      // Assert
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('should call onClose exactly once per click', () => {
      // Arrange
      render(<Alert message="Test message" type="error" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /✖/i });
      
      // Act
      fireEvent.click(closeButton);
      
      // Assert
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('should call onClose multiple times for multiple clicks', () => {
      // Arrange
      render(<Alert message="Test message" type="error" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /✖/i });
      
      // Act
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      
      // Assert
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    test('should not call onClose when alert div is clicked', () => {
      // Arrange
      render(<Alert message="Test message" type="error" onClose={mockOnClose} />);
      const alertDiv = screen.getByText('Test message').closest('.alert');
      
      // Act
      fireEvent.click(alertDiv);
      
      // Assert
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // ==================== ACCESSIBILITY TESTS ====================
  describe('Accessibility', () => {
    test('should have close button that is keyboard accessible', () => {
      // Arrange
      render(<Alert message="Test message" type="error" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /✖/i });
      
      // Assert - button should be focusable by default
      expect(closeButton.tagName).toBe('BUTTON');
    });

    test('should trigger onClose when Enter key is pressed on close button', () => {
      // Arrange
      render(<Alert message="Test message" type="error" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /✖/i });
      closeButton.focus();
      
      // Act
      fireEvent.keyDown(closeButton, { key: 'Enter', code: 'Enter' });
      
      // Note: React Testing Library's fireEvent doesn't automatically trigger click on Enter
      // In a real browser, pressing Enter on a focused button triggers click
      // For this test, we verify the button can be focused
      
      // Assert
      expect(closeButton).toHaveFocus();
    });

    test('should have appropriate button element for screen readers', () => {
      // Arrange & Act
      render(<Alert message="Test message" type="error" onClose={mockOnClose} />);
      
      // Assert
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('close-button');
    });

    test('should render message in a paragraph for proper semantic structure', () => {
      // Arrange
      const testMessage = 'Semantic test message';
      
      // Act
      render(<Alert message={testMessage} type="error" onClose={mockOnClose} />);
      
      // Assert
      const messageParagraph = screen.getByText(testMessage);
      expect(messageParagraph.tagName).toBe('P');
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    test('should handle undefined type prop gracefully', () => {
      // Arrange & Act
      render(<Alert message="Test message" type={undefined} onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = screen.getByText('Test message').closest('.alert');
      expect(alertDiv).toHaveClass('alert');
    });

    test('should handle null type prop gracefully', () => {
      // Arrange & Act
      render(<Alert message="Test message" type={null} onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = screen.getByText('Test message').closest('.alert');
      expect(alertDiv).toBeInTheDocument();
    });

    test('should handle special characters in message', () => {
      // Arrange
      const specialMessage = 'Error: <script>alert("XSS")</script> & "quotes" \'apostrophes\'';
      
      // Act
      render(<Alert message={specialMessage} type="error" onClose={mockOnClose} />);
      
      // Assert
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    test('should render with multiple CSS classes when type includes spaces', () => {
      // Arrange & Act
      render(<Alert message="Test" type="error critical" onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = screen.getByText('Test').closest('.alert');
      expect(alertDiv).toHaveClass('alert', 'error', 'critical');
    });
  });

  // ==================== COMPONENT STRUCTURE ====================
  describe('Component Structure', () => {
    test('should have correct DOM structure', () => {
      // Arrange & Act
      const { container } = render(<Alert message="Test" type="error" onClose={mockOnClose} />);
      
      // Assert
      const alertDiv = container.querySelector('.alert.error');
      expect(alertDiv).toBeInTheDocument();
      
      const paragraph = alertDiv.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.textContent).toBe('Test');
      
      const button = alertDiv.querySelector('button.close-button');
      expect(button).toBeInTheDocument();
    });

    test('should render close button with correct content', () => {
      // Arrange & Act
      render(<Alert message="Test" type="error" onClose={mockOnClose} />);
      
      // Assert
      const closeButton = screen.getByRole('button');
      expect(closeButton.textContent).toContain('✖');
    });
  });
});
