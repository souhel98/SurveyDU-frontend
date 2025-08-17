import React from 'react';

interface ParticipationPercentageProps {
  currentRating: number;
  onRatingChange: (rating: number) => void;
}

export default function ParticipationPercentage({ currentRating, onRatingChange }: ParticipationPercentageProps) {
  return (
    <div className="mt-4">
      <div className="flex justify-center space-x-3">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            onClick={() => onRatingChange(number)}
            className={`w-12 h-12 rounded-full transition-all duration-200 hover:scale-110 font-medium text-lg ${
              number <= currentRating
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            type="button"
          >
            {number}
          </button>
        ))}
      </div>
      <div className="text-center mt-4 text-sm text-gray-600">
        {currentRating === 0 && "Click a number to rate"}
        {currentRating === 1 && "Poor"}
        {currentRating === 2 && "Fair"}
        {currentRating === 3 && "Good"}
        {currentRating === 4 && "Very Good"}
        {currentRating === 5 && "Excellent"}
      </div>
    </div>
  );
} 