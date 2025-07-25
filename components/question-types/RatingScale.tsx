"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RatingScale() {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const stars = Array(5).fill(0);

  const handleMouseEnter = (index: number) => {
    setHoveredRating(index + 1);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleClick = (index: number) => {
    setRating(index + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-center space-x-2">
        {stars.map((_, index) => (
          <button
            key={index}
            className="p-1 hover:scale-110 transition-transform"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
          >
            <Star
              className={cn(
                "h-8 w-8",
                (hoveredRating > index || rating > index)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-sm text-gray-600">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
      {rating > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Selected Rating: {rating} star{rating !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
} 