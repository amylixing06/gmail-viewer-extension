import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { gmailFetchEmails } from '@spring-new/gmail';
import { GmailError, Email } from './types';

const handleError = (error: any): GmailError => {
  if (error.response?.status === 401) {
    return {
      type: 'AUTH_ERROR',
      message: '认证失败，请重新登录',
      details: error.response.data
    };
  }
  
  if (error.response?.status === 403) {
    return {
      type: 'AUTH_ERROR',
      message: '权限不足，请检查 Gmail API 权限设置',
      details: error.response.data
    };
  }
  
  if (error.message === 'Network Error') {
    return {
      type: 'NETWORK_ERROR',
      message: '网络连接失败，请检查网络设置',
      details: error
    };
  }
  
  if (error.response?.status >= 500) {
    return {
      type: 'API_ERROR',
      message: 'Gmail 服务暂时不可用，请稍后重试',
      details: error.response.data
    };
  }
  
  return {
    type: 'UNKNOWN_ERROR',
    message: '发生未知错误，请重试',
    details: error
  };
};

export const useUnreadEmails = () => {
  const { data, isLoading, error, refetch } = useQuery<{ messages: Email[] }, GmailError>(
    'unreadEmails',
    async () => {
      try {
        const result = await gmailFetchEmails({
          user_id: 'me',
          max_results: 20,
          label_ids: ['UNREAD', 'INBOX'],
          include_payload: true
        });
        return result;
      } catch (error) {
        throw handleError(error);
      }
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // 对于认证错误，不重试
        if (error.type === 'AUTH_ERROR') return false;
        // 最多重试3次
        return failureCount < 3;
      }
    }
  );

  const emails = data?.messages || [];

  return {
    emails,
    isLoading,
    error,
    refetch
  };
};