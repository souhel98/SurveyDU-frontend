"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getApiConfig } from "@/lib/config/api-config";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";
import LanguageSwitcher from "@/components/ui/language-switcher";

export default function ForgotPassword() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentLocale, setCurrentLocale } = useLocale();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const apiConfig = getApiConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    try {
      const response = await fetch(`${apiConfig.BASE_URL}/Auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      toast({
        title: t('auth.passwordReset', currentLocale),
        description: t('auth.passwordResetEmailSent', currentLocale),
      });
      setSuccess(true);
    } catch {
      toast({
        title: t('common.error', currentLocale),
        description: t('auth.failedToSendResetEmail', currentLocale),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-2 sm:p-3 rounded-xl mr-2 sm:mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="font-bold text-base sm:text-lg">SurveyDU</span>
                </div>
              </Link>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-6">
              <LanguageSwitcher currentLocale={currentLocale} onLocaleChange={setCurrentLocale} />
              <Link href="/" className="hidden sm:block text-gray-600 hover:text-emerald-500 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-50">
                {t('navigation.home', currentLocale)}
              </Link>
              <Button
                asChild
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-3 py-2 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                <Link href="/auth/signin">
                  <span className="hidden sm:inline">{t('auth.backToSignIn', currentLocale)}</span>
                  <span className="sm:hidden">{t('auth.signIn', currentLocale)}</span>
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Form Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.forgotPassword', currentLocale)}</CardTitle>
          <CardDescription>{t('auth.forgotPasswordDescription', currentLocale)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder={t('auth.enterYourEmail', currentLocale)}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading || success}
            />
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading || success}>
              {isLoading ? t('auth.sending', currentLocale) : t('auth.sendResetLink', currentLocale)}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 