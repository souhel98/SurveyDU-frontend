import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Option {
  optionId: number;
  optionText: string;
  optionOrder: number;
}

interface ParticipationMultipleChoiceProps {
  options: Option[];
  selectedOptions: number[];
  onSelectionChange: (optionId: number) => void;
}

export default function ParticipationMultipleChoice({ 
  options, 
  selectedOptions, 
  onSelectionChange 
}: ParticipationMultipleChoiceProps) {
  return (
    <div className="space-y-3 mt-4">
      {options?.map((option) => (
        <div key={option.optionId} className="flex items-center space-x-2">
          <Checkbox
            id={`option-${option.optionId}`}
            checked={selectedOptions.includes(option.optionId)}
            onCheckedChange={() => onSelectionChange(option.optionId)}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <Label 
            htmlFor={`option-${option.optionId}`} 
            className="cursor-pointer select-none"
          >
            {option.optionText}
          </Label>
        </div>
      ))}
    </div>
  );
} 