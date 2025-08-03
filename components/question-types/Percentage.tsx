import React from 'react';

export default function Percentage() {
  return (
    <div className="space-y-2">
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="text-2xl text-gray-300">
            ★
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 text-center">Students will rate from 1 to 5 stars.</p>
    </div>
  );
} 