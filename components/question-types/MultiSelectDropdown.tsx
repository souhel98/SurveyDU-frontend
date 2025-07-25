"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface Option {
  id: number;
  text: string;
}

export default function MultiSelectDropdown() {
  const [options, setOptions] = useState<Option[]>([
    { id: 1, text: "Option 1" },
    { id: 2, text: "Option 2" },
  ]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [newOptionText, setNewOptionText] = useState("");

  const addOption = () => {
    if (!newOptionText.trim()) return;
    const newId = options.length + 1;
    const newOption = { id: newId, text: newOptionText.trim() };
    setOptions([...options, newOption]);
    setNewOptionText("");
  };

  const removeOption = (idToRemove: number) => {
    if (options.length <= 2) return; // Maintain minimum 2 options
    setOptions(options.filter(({ id }) => id !== idToRemove));
    setSelectedOptions(selectedOptions.filter(({ id }) => id !== idToRemove));
  };

  const toggleOption = (option: Option) => {
    const isSelected = selectedOptions.some(({ id }) => id === option.id);
    if (isSelected) {
      setSelectedOptions(selectedOptions.filter(({ id }) => id !== option.id));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addOption();
    }
  };

  return (
    <div>
      <div className="border rounded-md p-2 min-h-[100px]">
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((option) => (
            <Badge key={option.id} variant="secondary" className="px-3 py-1">
              {option.text}
              <button
                className="ml-2"
                onClick={() => toggleOption(option)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Button
                variant={selectedOptions.some(({ id }) => id === option.id) ? "secondary" : "outline"}
                className="flex-1 justify-start"
                onClick={() => toggleOption(option)}
              >
                {option.text}
              </Button>
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(option.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <Input
          type="text"
          placeholder="Type to add options..."
          value={newOptionText}
          onChange={(e) => setNewOptionText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          variant="outline"
          onClick={addOption}
          disabled={!newOptionText.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 