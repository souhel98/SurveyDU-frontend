"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function SingleLineInput() {
  const [answer, setAnswer] = useState("");

  return (
    <div>
      <Input
        type="text"
        placeholder="Type your answer here..."
        className="w-full"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      {answer && (
        <p className="mt-2 text-sm text-gray-600">
          Current answer: {answer}
        </p>
      )}
    </div>
  );
} 