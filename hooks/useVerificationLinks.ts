import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { gmailFetchEmails } from '@spring-new/gmail';

interface VerificationLink {
  id: string; 
  messageId: string;
  threadId: string;
  sender: string;
  subject: string;
  link: string;
  linkText: string;
  timestamp: string;
}

export const useVerificationLinks = () => {
  const [verificationLinks, setVerificationLinks] = useState<VerificationLink[]>([]);
  
  const { data, isLoading, error, refetch } = useQuery(
    'verificationLinkEmails',
    async () => {
      // Search for common verification email keywords
      const result = await gmailFetchEmails({
        user_id: 'me',
        max_results: 30,
        query: 'verify OR confirm OR activate OR verification OR 验证',
        include_payload: true
      });
      return result;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  useEffect(() => {
    const emails = data?.messages || [];
    if (emails.length > 0) {
      const extractedLinks: VerificationLink[] = [];
      
      emails.forEach(email => {
        // Track unique links within this email
        const uniqueLinksInEmail = new Set<string>();
        
        // Extract links from body text
        const bodyText = email.messageText || email.preview?.body || '';
        
        // Simple regex to find URLs in text
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let matches = bodyText.match(urlRegex) || [];
        
        // If found links, process them
        if (matches && matches.length > 0) {
          // Use Set to ensure unique URLs
          const uniqueMatches = [...new Set(matches)];
          
          uniqueMatches.forEach((url, index) => {
            // Clean up URL - remove trailing punctuation that might be part of the text
            let cleanUrl = url.replace(/[.,;:'"!?)]$/, '');
            
            // Filter out common non-verification URLs and look for verification-related keywords
            if (!uniqueLinksInEmail.has(cleanUrl) && 
                !/\.(jpg|jpeg|png|gif|css|js)$/i.test(cleanUrl) && 
                /verify|confirm|activate|account|auth|reset|token|click|验证|确认|激活/i.test(cleanUrl)) {
              
              uniqueLinksInEmail.add(cleanUrl);
              
              extractedLinks.push({
                id: `${email.messageId}-${index}-${Math.random().toString(36).substring(2, 9)}`,
                messageId: email.messageId,
                threadId: email.threadId,
                sender: email.sender,
                subject: email.subject || '(无主题)',
                link: cleanUrl,
                linkText: detectLinkText(bodyText, cleanUrl) || '验证链接',
                timestamp: email.messageTimestamp
              });
            }
          });
        }
      });

      setVerificationLinks(extractedLinks);
    } else {
      setVerificationLinks([]);
    }
  }, [data]);

  // Helper function to try to detect link text from surrounding content
  const detectLinkText = (bodyText: string, url: string): string | null => {
    // Try to find text surrounding the URL that might indicate what the link is for
    const textBefore = bodyText.substring(Math.max(0, bodyText.indexOf(url) - 50), bodyText.indexOf(url)).trim();
    const textAfter = bodyText.substring(bodyText.indexOf(url) + url.length, Math.min(bodyText.indexOf(url) + url.length + 50)).trim();
    
    // Look for common verification phrases
    const phrases = [
      /click\s+(?:here|this\s+link)\s+to\s+(verify|confirm|activate)/i,
      /(verify|confirm|activate|验证|确认|激活)(?:\s+your|\s+account|\s+email|\s+邮箱)/i,
      /(点击|点此|请点击)(?:\s+链接|\s+验证|\s+确认)/i
    ];
    
    for (const pattern of phrases) {
      const beforeMatch = textBefore.match(pattern);
      if (beforeMatch) return beforeMatch[0];
      
      const afterMatch = textAfter.match(pattern);
      if (afterMatch) return afterMatch[0];
    }
    
    return null;
  };

  return {
    verificationLinks,
    isLoading,
    error,
    refetch
  };
};