import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useCopyToClipboard } from '@/application/hooks/useCopyToClipboard';
import { VerificationCode } from '@/application/hooks/types';

interface VerificationCodeItemProps {
  code: VerificationCode;
}

export const VerificationCodeItem: React.FC<VerificationCodeItemProps> = ({ code }) => {
  const { t } = useTranslation();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const formattedDate = formatDistanceToNow(new Date(code.timestamp), { 
    addSuffix: true,
    locale: zhCN
  });

  const handleCopy = () => {
    copyToClipboard(code.code);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium line-clamp-1">
            {code.subject}
          </CardTitle>
          <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
            {formattedDate}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          来自: {code.sender?.split('<')[0] || code.sender || '未知发件人'}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-wider">{code.code}</span>
            {code.expiryTime && (
              <span className="text-sm text-muted-foreground">
                {t('verification.expiry_time', { time: code.expiryTime })}
              </span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                {t('verification.code_copied')}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t('verification.copy_code')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 