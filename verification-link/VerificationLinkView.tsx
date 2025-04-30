import React from 'react';
import { useVerificationLinks } from '@/application/hooks/useVerificationLinks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCcw, ExternalLink, Link } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const VerificationLinkView: React.FC = () => {
  const { verificationLinks, isLoading, error, refetch } = useVerificationLinks();

  const handleRefresh = () => {
    refetch();
  };

  // Open link in new tab
  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  // Open Gmail in new tab
  const openInGmail = (threadId: string) => {
    const url = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
    window.open(url, '_blank');
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            获取验证链接时出错: {error.message}
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
        <h2 className="text-lg font-medium">验证链接 ({isLoading ? '...' : verificationLinks.length})</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="border rounded-md p-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-[250px] mb-2" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ))
        ) : verificationLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            没有找到验证链接
          </div>
        ) : (
          // Use the unique ID field for the key
          verificationLinks.map((item) => {
            const formattedDate = formatDistanceToNow(new Date(item.timestamp), { 
              addSuffix: true,
              locale: zhCN
            });
            
            return (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium line-clamp-1">
                      {item.subject}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
                      {formattedDate}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    来自: {item.sender?.split('<')[0] || item.sender || '未知发件人'}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-sm font-medium">链接文本:</span>
                    <span className="text-sm">{item.linkText}</span>
                  </div>
                  <ScrollArea className="h-8 w-full">
                    <div className="text-xs text-muted-foreground break-all">
                      {item.link}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openLink(item.link)}
                  >
                    <Link className="mr-2 h-4 w-4" />
                    打开链接
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openInGmail(item.threadId)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    在 Gmail 中查看
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};