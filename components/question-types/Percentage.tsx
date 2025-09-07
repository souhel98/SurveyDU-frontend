import React from 'react';
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

export default function Percentage() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();

  return (
    <div className="space-y-2">
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((number) => (
          <div key={number} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            {number}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 text-center">{t('common.questionTypes.percentageDescription', currentLocale)}</p>
    </div>
  );
} 