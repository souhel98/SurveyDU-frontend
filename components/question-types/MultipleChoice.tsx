import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

interface Option {
  id: number;
  text: string;
  checked: boolean;
  order: number;
}

interface MultipleChoiceProps {
  options: Option[];
  onOptionsChange: (options: Option[]) => void;
}

export default function MultipleChoice({ options, onOptionsChange }: MultipleChoiceProps) {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={`option-${option.id}`}
            checked={option.checked}
            onCheckedChange={(checked) => {
              const newOptions = [...options];
              newOptions[index] = { ...option, checked: !!checked };
              onOptionsChange(newOptions);
            }}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <Input
            value={option.text}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index] = { ...option, text: e.target.value };
              onOptionsChange(newOptions);
            }}
            placeholder={t('common.questionTypes.optionPlaceholder', currentLocale).replace('{number}', (index + 1).toString())}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newOptions = options.filter((_, i) => i !== index);
              onOptionsChange(newOptions);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const newOption = {
            id: Date.now(),
            text: '',
            checked: false,
            order: options.length
          };
          onOptionsChange([...options, newOption]);
        }}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t('common.questionTypes.addOption', currentLocale)}
      </Button>
    </div>
  );
} 