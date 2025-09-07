import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

interface ParticipationOpenTextProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ParticipationOpenText({ value, onChange }: ParticipationOpenTextProps) {
  const { t } = useTranslation()
  const { currentLocale } = useLocale()
  
  return (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('common.questionTypes.openTextPlaceholder', currentLocale)}
      className="mt-4 h-32"
    />
  );
} 