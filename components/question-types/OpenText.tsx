import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

export default function OpenText() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();

  return (
    <div className="space-y-2">
      <Textarea
        placeholder={t('common.questionTypes.openTextPlaceholder', currentLocale)}
        className="h-24 resize-none"
        disabled
      />
      <p className="text-sm text-gray-500">{t('common.questionTypes.openTextDescription', currentLocale)}</p>
    </div>
  );
} 