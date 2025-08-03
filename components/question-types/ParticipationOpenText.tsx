import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface ParticipationOpenTextProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ParticipationOpenText({ value, onChange }: ParticipationOpenTextProps) {
  return (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer here..."
      className="mt-4 h-32"
    />
  );
} 