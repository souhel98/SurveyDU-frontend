"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface DropdownOption {
  id: number;
  text: string;
  value: string;
}

export default function Dropdown() {
  const [options, setOptions] = useState<DropdownOption[]>([
    { id: 1, text: "", value: "option1" },
    { id: 2, text: "", value: "option2" },
  ]);
  const [selectedValue, setSelectedValue] = useState<string>("");

  const addOption = () => {
    const newId = options.length + 1;
    setOptions([
      ...options,
      { id: newId, text: "", value: `option${newId}` },
    ]);
  };

  const removeOption = (idToRemove: number) => {
    if (options.length <= 2) return; // Maintain minimum 2 options
    setOptions(options.filter(({ id }) => id !== idToRemove));
    if (selectedValue === `option${idToRemove}`) {
      setSelectedValue("");
    }
  };

  const updateOptionText = (id: number, text: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, text } : option
      )
    );
  };

  return (
    <div>
      <Select value={selectedValue} onValueChange={setSelectedValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ id, text, value }) => (
            <SelectItem key={id} value={value}>
              {text || `Option ${id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mt-4 space-y-2">
        {options.map(({ id, text }) => (
          <div key={id} className="flex items-center space-x-2">
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
        ))}
      </div>
      <Button
        variant="outline"
        className="mt-4"
        onClick={addOption}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Option
      </Button>
    </div>
  );
} 