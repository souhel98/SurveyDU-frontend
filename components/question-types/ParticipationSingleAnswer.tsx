import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/ui/locale-provider";

interface Option {
  optionId: number;
  optionText: string;
  optionOrder: number;
}

interface ParticipationSingleAnswerProps {
  options: Option[];
  selectedOption: string;
  onSelectionChange: (value: string) => void;
}

export default function ParticipationSingleAnswer({ 
  options, 
  selectedOption, 
  onSelectionChange 
}: ParticipationSingleAnswerProps) {
  const { currentLocale } = useLocale()
  
  return (
    <RadioGroup
      value={selectedOption || ""}
      onValueChange={onSelectionChange}
      className="space-y-3 mt-4"
    >
      {options?.map((option) => (
        <div key={option.optionId} className={`flex items-center ${currentLocale === 'ar' ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'}`}>
          <RadioGroupItem value={option.optionId.toString()} id={`option-${option.optionId}`} />
          <Label htmlFor={`option-${option.optionId}`} className="cursor-pointer">
            {option.optionText}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
} 