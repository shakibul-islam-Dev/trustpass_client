"use client";

import React, { useState } from "react";
import { Star, MessageSquare } from "lucide-react";

interface RatingCardProps {
  averageRating?: number;
  totalReviews?: number;
  userRating?: number;

  // Optional API endpoint
  apiEndpoint?: string;

  // Custom labels
  reviewLabel?: string;
  ratingLabel?: string;

  // Rating submit callback
  onRatingSubmit?: (rating: number) => Promise<void> | void;

  // UI options
  showReviews?: boolean;
  showUserRating?: boolean;
  loading?: boolean;
  disabled?: boolean;

  className?: string;
}

const RatingCard: React.FC<RatingCardProps> = ({
  averageRating = 0,
  totalReviews = 0,
  userRating = 0,

  apiEndpoint,

  reviewLabel = "reviews",
  ratingLabel = "Rate this",

  onRatingSubmit,

  showReviews = true,
  showUserRating = true,
  loading = false,
  disabled = false,

  className = "",
}) => {
  const [currentRating, setCurrentRating] = useState<number>(userRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRating = async (rating: number): Promise<void> => {
    if (disabled || isSubmitting) return;

    const previousRating = currentRating;

    // Optimistic UI
    setCurrentRating(rating);
    setIsSubmitting(true);

    try {
      // External callback
      if (onRatingSubmit) {
        await onRatingSubmit(rating);
      }

      // Optional API call
      if (apiEndpoint) {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit rating");
        }
      }
    } catch (error: unknown) {
      // Rollback optimistic update
      setCurrentRating(previousRating);

      console.error("Rating submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`w-full max-w-sm rounded-2xl border bg-white p-4 shadow-sm ${className}`}
      >
        <div className="animate-pulse space-y-3">
  
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-6 w-40 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  const displayedRating = hoverRating || currentRating;

  return (
    <div
      className={`w-full max-w-sm rounded-2xl border bg-white p-4 shadow-sm ${className}`}
    >
   
    
      {showUserRating && (
        <hr className="my-3 border-gray-100" />
      )}

      {/* User Rating */}
      {showUserRating && (
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-600">
            {currentRating > 0
              ? `Your rating: ${currentRating}/5`
              : ratingLabel}
          </p>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star: number) => {
              const isActive = star <= displayedRating;

              return (
                <button
                  key={star}
                  type="button"
                  disabled={disabled || isSubmitting}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} out of 5`}
                  className="cursor-pointer transition-transform hover:scale-110 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Star
                    size={24}
                    className={
                      isActive
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              );
            })}
          </div>

          {/* Submitting state */}
          {isSubmitting && (
            <p className="mt-2 text-xs text-gray-400">
              Saving rating...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingCard;
