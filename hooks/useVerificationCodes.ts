import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { gmailFetchEmails } from '@spring-new/gmail';
import { GmailError, VerificationCode } from './types';

const handleError = (error: any): GmailError => {
  if (error.response?.status === 401) {
    return {
      type: 'AUTH_ERROR',
      message: '认证失败，请重新登录',
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
  
  return {
    type: 'UNKNOWN_ERROR',
    message: '发生未知错误，请重试',
    details: error
  };
};

const extractExpiryTime = (text: string): string | undefined => {
  const expiryPatterns = [
    { pattern: /有效期[：:\s]*(\d+)分钟/, unit: '分钟' },
    { pattern: /(\d+)分钟内有效/, unit: '分钟' },
    { pattern: /expires in (\d+) minutes/i, unit: '分钟' },
    { pattern: /valid for (\d+) minutes/i, unit: '分钟' },
    { pattern: /有效期[：:\s]*(\d+)小时/, unit: '小时' },
    { pattern: /(\d+)小时内有效/, unit: '小时' },
    { pattern: /expires in (\d+) hours/i, unit: '小时' },
    { pattern: /valid for (\d+) hours/i, unit: '小时' }
  ];

  for (const { pattern, unit } of expiryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return `${match[1]}${unit}`;
    }
  }
  return undefined;
};

export const useVerificationCodes = () => {
  const { data, isLoading, error, refetch } = useQuery<{ messages: any[] }, GmailError>(
    'verificationEmails',
    async () => {
      try {
        const result = await gmailFetchEmails({
          user_id: 'me',
          max_results: 30,
          query: 'verification code OR 验证码 OR security code OR confirmation code OR OTP OR 一次性密码 OR 临时密码',
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
        if (error.type === 'AUTH_ERROR') return false;
        return failureCount < 3;
      }
    }
  );

  const emails = data?.messages || [];
  const [verificationCodes, setVerificationCodes] = useState<VerificationCode[]>([]);

  useEffect(() => {
    if (emails.length > 0) {
      const extractedCodes = emails.map(email => {
        const patterns = [
          /验证码[：:\s]*([0-9A-Za-z]{4,8})/i,
          /验证码是[：:\s]*([0-9A-Za-z]{4,8})/i,
          /verification code[：:\s]*([0-9A-Za-z]{4,8})/i,
          /security code[：:\s]*([0-9A-Za-z]{4,8})/i,
          /code[：:\s]*([0-9A-Za-z]{4,8})/i,
          /([0-9A-Za-z]{4,8})[\s\n]+是您的验证码/i,
          /您的验证码是[：:\s]*([0-9A-Za-z]{4,8})/i,
          /your code is[：:\s]*([0-9A-Za-z]{4,8})/i,
          /您的动态密码为[：:\s]*([0-9A-Za-z]{4,8})/i,
          /一次性密码[：:\s]*([0-9A-Za-z]{4,8})/i,
          /临时密码[：:\s]*([0-9A-Za-z]{4,8})/i,
          /OTP[：:\s]*([0-9A-Za-z]{4,8})/i,
          /([0-9A-Za-z]{4,8})[\s\n]+is your verification code/i,
          /your verification code is[：:\s]*([0-9A-Za-z]{4,8})/i
        ];

        const bodyText = email.messageText || email.preview?.body || '';
        const subjectText = email.subject || '';
        let code = '';

        // Try to find code in subject first
        for (const pattern of patterns) {
          const match = subjectText.match(pattern);
          if (match && match[1]) {
            code = match[1];
            break;
          }
        }

        // If not found in subject, try body
        if (!code) {
          for (const pattern of patterns) {
            const match = bodyText.match(pattern);
            if (match && match[1]) {
              code = match[1];
              break;
            }
          }
        }

        // If still not found, try to find any 4-8 digit/alphanumeric code
        if (!code) {
          const codeMatch = bodyText.match(/\b([0-9A-Za-z]{4,8})\b/);
          if (codeMatch && codeMatch[1]) {
            code = codeMatch[1];
          }
        }

        if (code) {
          return {
            messageId: email.messageId,
            threadId: email.threadId,
            sender: email.sender,
            subject: email.subject || '(无主题)',
            code: code,
            timestamp: email.messageTimestamp,
            body: bodyText,
            expiryTime: extractExpiryTime(bodyText)
          };
        }
        return null;
      }).filter((item): item is VerificationCode => item !== null);

      setVerificationCodes(extractedCodes);
    } else {
      setVerificationCodes([]);
    }
  }, [emails]);

  return {
    verificationCodes,
    isLoading,
    error,
    refetch
  };
};