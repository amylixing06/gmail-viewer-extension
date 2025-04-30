import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Type definition for email
interface Email {
  messageId: string;
  threadId: string;
  subject: string;
  sender: string;
  to: string;
  preview: {
    body: string;
    subject: string;
  };
  messageTimestamp: string;
}

interface EmailListItemProps {
  email: Email;
}

export const EmailListItem: React.FC<EmailListItemProps> = ({ email }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Format date
  const formattedDate = formatDistanceToNow(new Date(email.messageTimestamp), { 
    addSuffix: true,
    locale: zhCN
  });

  // Open Gmail in new tab
  const openInGmail = () => {
    const url = `https://mail.google.com/mail/u/0/#inbox/${email.threadId}`;
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium line-clamp-1">
            {email.subject || '(无主题)'}
          </CardTitle>
          <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
            {formattedDate}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          来自: {email.sender?.split('<')[0] || email.sender || '未知发件人'}
        </div>
      </CardHeader>
      <CardContent className={`pt-0 ${isExpanded ? '' : 'line-clamp-2'}`}>
        <p className="text-sm">
          {email.preview?.body || '无内容预览'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="ghost" size="sm" onClick={toggleExpand}>
          <Eye className="mr-2 h-4 w-4" />
          {isExpanded ? '收起' : '展开'}
        </Button>
        <Button variant="outline" size="sm" onClick={openInGmail}>
          <ExternalLink className="mr-2 h-4 w-4" />
          在 Gmail 中查看
        </Button>
      </CardFooter>
    </Card>
  );
};