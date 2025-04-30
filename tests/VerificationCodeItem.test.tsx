import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VerificationCodeItem } from '@/application/verification-code/VerificationCodeItem';
import { useCopyToClipboard } from '@/application/hooks/useCopyToClipboard';

// Mock the useCopyToClipboard hook
jest.mock('@/application/hooks/useCopyToClipboard');

describe('VerificationCodeItem', () => {
  const mockCode = {
    messageId: '1',
    threadId: 'thread1',
    sender: 'sender@example.com',
    subject: 'Test Verification Code',
    code: '123456',
    timestamp: '2024-01-01T00:00:00Z',
    body: 'Your verification code is 123456',
    expiryTime: '5分钟'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders verification code correctly', () => {
    (useCopyToClipboard as jest.Mock).mockReturnValue({
      isCopied: false,
      copyToClipboard: jest.fn()
    });

    render(<VerificationCodeItem code={mockCode} />);
    
    expect(screen.getByText('Test Verification Code')).toBeInTheDocument();
    expect(screen.getByText('sender@example.com')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
    expect(screen.getByText('有效期：5分钟')).toBeInTheDocument();
  });

  it('calls copyToClipboard when copy button is clicked', () => {
    const mockCopyToClipboard = jest.fn();
    (useCopyToClipboard as jest.Mock).mockReturnValue({
      isCopied: false,
      copyToClipboard: mockCopyToClipboard
    });

    render(<VerificationCodeItem code={mockCode} />);
    
    const copyButton = screen.getByText('复制验证码');
    fireEvent.click(copyButton);

    expect(mockCopyToClipboard).toHaveBeenCalledWith('123456');
  });

  it('shows copied state when code is copied', () => {
    (useCopyToClipboard as jest.Mock).mockReturnValue({
      isCopied: true,
      copyToClipboard: jest.fn()
    });

    render(<VerificationCodeItem code={mockCode} />);
    
    expect(screen.getByText('验证码已复制')).toBeInTheDocument();
  });
}); 