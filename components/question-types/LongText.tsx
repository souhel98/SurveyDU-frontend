"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function LongText() {
  const [answer, setAnswer] = useState("");

  return (
    <div>
      <Textarea
        placeholder="Type your answer here..."
        className="min-h-[150px]"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      {answer && (
        <p className="mt-2 text-sm text-gray-600">
          Characters: {answer.length}
        </p>
      )}
    </div>
  );
} 