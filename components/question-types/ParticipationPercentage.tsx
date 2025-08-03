import React from 'react';

interface ParticipationPercentageProps {
  currentRating: number;
  onRatingChange: (rating: number) => void;
}

export default function ParticipationPercentage({ currentRating, onRatingChange }: ParticipationPercentageProps) {
  return (
    <div className="mt-4">
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className={`text-3xl transition-all duration-200 hover:scale-110 ${
              star <= currentRating
                ? "text-yellow-400 fill-current"
                : "text-gray-300 hover:text-yellow-300"
            }`}
            type="button"
          >
            ★
          </button>
        ))}
      </div>
      <div className="text-center mt-3 text-sm text-gray-600">
        {currentRating === 0 && "Click a star to rate"}
        {currentRating === 1 && "Poor"}
        {currentRating === 2 && "Fair"}
        {currentRating === 3 && "Good"}
        {currentRating === 4 && "Very Good"}
        {currentRating === 5 && "Excellent"}
      </div>
    </div>
  );
} 