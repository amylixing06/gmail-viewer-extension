import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVerificationCodes } from '@/application/hooks/useVerificationCodes';
import { VerificationCodeItem } from '@/application/verification-code/VerificationCodeItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCcw } from 'lucide-react';

export const VerificationCodeView: React.FC = () => {
  const { t } = useTranslation();
  const { verificationCodes, isLoading, error, refetch } = useVerificationCodes();

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            {t(`error.${error.type.toLowerCase()}`)}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          {t('verification_codes')} ({isLoading ? '...' : verificationCodes.length})
        </h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          {t('refresh')}
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
        ) : verificationCodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('no_verification_codes')}
          </div>
        ) : (
          verificationCodes.map((code) => (
            <VerificationCodeItem key={code.messageId} code={code} />
          ))
        )}
      </div>
    </div>
  );
};