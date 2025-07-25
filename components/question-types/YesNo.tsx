"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function YesNo() {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);

  return (
    <div>
      <RadioGroup value={answer || ""} onValueChange={(value) => setAnswer(value as "yes" | "no")}>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no">No</Label>
          </div>
        </div>
      </RadioGroup>
      {answer && (
        <p className="mt-4 text-sm text-gray-600">
          Selected answer: {answer.charAt(0).toUpperCase() + answer.slice(1)}
        </p>
      )}
    </div>
  );
} 