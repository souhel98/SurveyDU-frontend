import React from 'react';
import { useLocale } from '@/components/ui/locale-provider';
import { useTranslation } from '@/hooks/useTranslation';

interface ParticipationPercentageProps {
  currentRating: number;
  onRatingChange: (rating: number) => void;
}

export default function ParticipationPercentage({ currentRating, onRatingChange }: ParticipationPercentageProps) {
  const { currentLocale } = useLocale();
  const { t } = useTranslation();
  
  return (
    <div className="mt-4">
      <div className={`flex justify-center ${currentLocale === 'ar' ? 'space-x-4 sm:space-x-6' : 'space-x-2 sm:space-x-3'}`}>
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            onClick={() => onRatingChange(number)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 hover:scale-110 font-medium text-base sm:text-lg ${
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
        {currentRating === 0 && t('common.questionTypes.percentageDescription', currentLocale)}
        {currentRating === 1 && (currentLocale === 'ar' ? 'ضعيف' : 'Poor')}
        {currentRating === 2 && (currentLocale === 'ar' ? 'مقبول' : 'Fair')}
        {currentRating === 3 && (currentLocale === 'ar' ? 'جيد' : 'Good')}
        {currentRating === 4 && (currentLocale === 'ar' ? 'جيد جداً' : 'Very Good')}
        {currentRating === 5 && (currentLocale === 'ar' ? 'ممتاز' : 'Excellent')}
      </div>
    </div>
  );
} 