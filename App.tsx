import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailList } from '@/application/email-list/EmailList';
import { VerificationCodeView } from '@/application/verification-code/VerificationCodeView';
import { VerificationLinkView } from '@/application/verification-link/VerificationLinkView';
import { Mail, Code, Link } from "lucide-react";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('email-list');
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            {t('gmail_viewer')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="email-list" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
              <TabsTrigger 
                value="email-list" 
                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-4"
              >
                <Mail className="mr-2 h-4 w-4" />
                {t('unread_emails')}
              </TabsTrigger>
              <TabsTrigger 
                value="verification-codes" 
                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-4"
              >
                <Code className="mr-2 h-4 w-4" />
                {t('verification_codes')}
              </TabsTrigger>
              <TabsTrigger 
                value="verification-links" 
                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-4"
              >
                <Link className="mr-2 h-4 w-4" />
                {t('verification_links')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email-list" className="p-0 border-none">
              <EmailList />
            </TabsContent>
            <TabsContent value="verification-codes" className="p-0 border-none">
              <VerificationCodeView />
            </TabsContent>
            <TabsContent value="verification-links" className="p-0 border-none">
              <VerificationLinkView />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;