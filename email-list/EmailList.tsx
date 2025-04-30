import React from 'react';
import { useUnreadEmails } from '@/application/hooks/useUnreadEmails';
import { EmailListItem } from '@/application/email-list/EmailListItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const EmailList: React.FC = () => {
  const { emails, isLoading, error, refetch } = useUnreadEmails();

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            获取邮件时出错: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" />
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">未读邮件 ({isLoading ? '...' : emails.length})</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-[250px] mb-2" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
              <Skeleton className="h-4 w-[350px] mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))
        ) : emails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            没有未读邮件
          </div>
        ) : (
          emails.map((email) => (
            <EmailListItem key={email.messageId} email={email} />
          ))
        )}
      </div>
    </div>
  );
};