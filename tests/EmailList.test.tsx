import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailList } from '@/application/email-list/EmailList';
import { useUnreadEmails } from '@/application/hooks/useUnreadEmails';

// Mock the useUnreadEmails hook
jest.mock('@/application/hooks/useUnreadEmails');

describe('EmailList', () => {
  const mockEmails = [
    {
      messageId: '1',
      threadId: 'thread1',
      subject: 'Test Email 1',
      sender: 'sender1@example.com',
      to: 'me@example.com',
      preview: {
        body: 'This is a test email body',
        subject: 'Test Email 1'
      },
      messageTimestamp: '2024-01-01T00:00:00Z'
    },
    {
      messageId: '2',
      threadId: 'thread2',
      subject: 'Test Email 2',
      sender: 'sender2@example.com',
      to: 'me@example.com',
      preview: {
        body: 'This is another test email body',
        subject: 'Test Email 2'
      },
      messageTimestamp: '2024-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useUnreadEmails as jest.Mock).mockReturnValue({
      emails: [],
      isLoading: true,
      error: null,
      refetch: jest.fn()
    });

    render(<EmailList />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
  });

  it('renders empty state correctly', () => {
    (useUnreadEmails as jest.Mock).mockReturnValue({
      emails: [],
      isLoading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<EmailList />);
    expect(screen.getByText('没有未读邮件')).toBeInTheDocument();
  });

  it('renders emails correctly', () => {
    (useUnreadEmails as jest.Mock).mockReturnValue({
      emails: mockEmails,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<EmailList />);
    expect(screen.getByText('Test Email 1')).toBeInTheDocument();
    expect(screen.getByText('Test Email 2')).toBeInTheDocument();
    expect(screen.getByText('sender1@example.com')).toBeInTheDocument();
    expect(screen.getByText('sender2@example.com')).toBeInTheDocument();
  });

  it('handles error state correctly', () => {
    const mockError = new Error('Test error');
    (useUnreadEmails as jest.Mock).mockReturnValue({
      emails: [],
      isLoading: false,
      error: mockError,
      refetch: jest.fn()
    });

    render(<EmailList />);
    expect(screen.getByText('获取邮件时出错: Test error')).toBeInTheDocument();
  });

  it('calls refetch when refresh button is clicked', async () => {
    const mockRefetch = jest.fn();
    (useUnreadEmails as jest.Mock).mockReturnValue({
      emails: mockEmails,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    render(<EmailList />);
    const refreshButton = screen.getByText('刷新');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });
}); 