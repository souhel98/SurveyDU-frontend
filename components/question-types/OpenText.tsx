import React from 'react';
import { Textarea } from "@/components/ui/textarea";

export default function OpenText() {
  return (
    <div className="space-y-2">
      <Textarea
        placeholder="This is an open text question. Students will be able to enter their response here."
        className="h-24 resize-none"
        disabled
      />
      <p className="text-sm text-gray-500">Students can enter free text responses for this question.</p>
    </div>
  );
} 