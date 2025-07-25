"use client";

import { useState } from "react";
import { Radio, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface RadioOption {
  id: number;
  text: string;
  value: string;
}

interface RadioButtonGroupProps {
  options: RadioOption[];
  onOptionsChange: (options: RadioOption[]) => void;
}

export default function RadioButtonGroup({ options, onOptionsChange }: RadioButtonGroupProps) {
  const [selectedOption, setSelectedOption] = useState(options[0]?.value || "");

  const addOption = () => {
    const newId = options.length > 0 ? Math.max(...options.map(o => o.id)) + 1 : 1;
    onOptionsChange([
      ...options,
      { id: newId, text: "", value: `option${newId}` },
    ]);
  };

  const removeOption = (idToRemove: number) => {
    if (options.length <= 2) return; // Maintain minimum 2 options
    onOptionsChange(options.filter(({ id }) => id !== idToRemove));
  };

  const updateOptionText = (id: number, text: string) => {
    onOptionsChange(
      options.map((option) =>
        option.id === id ? { ...option, text } : option
      )
    );
  };

  return (
    <div className="mb-6">
      <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
        <div className="space-y-3">
          {options.map(({ id, text, value }) => (
            <div key={id} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={value} />
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder={`Option ${id}`}
                  value={text}
                  onChange={(e) => updateOptionText(id, e.target.value)}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
      <Button
        variant="outline"
        className="mt-2"
        onClick={addOption}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Option
      </Button>
    </div>
  );
} 