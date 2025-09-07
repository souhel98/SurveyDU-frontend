"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";
import LanguageSwitcher from "@/components/ui/language-switcher";

export default function RegistrationSuccess() {
  const { t } = useTranslation();
  const { currentLocale, setCurrentLocale } = useLocale();
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

      {/* Success Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-600">{t('auth.registrationSuccessful', currentLocale)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl mb-4">✉️</div>
            <p className="text-gray-600">
              {t('auth.registrationSuccessMessage', currentLocale)}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                {t('auth.proceedToLogin', currentLocale)}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 