import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReviewSectionProps {
  mediaId: number;
}

export default function ReviewSection({ mediaId }: ReviewSectionProps) {
  const { rates, setRating, revs, addReview, toast } = useApp();
  const [reviewInput, setReviewInput] = useState("");

  const currentRate = rates[mediaId] || 0;
  const currentReviews = revs[mediaId] || [];

  const handlePost = () => {
    if (!reviewInput.trim()) {
      toast("Write something first");
      return;
    }
    addReview(mediaId, reviewInput);
    setReviewInput("");
  };

  return (
    <div>
      <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-8 mb-3">
        Reviews & Rating
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3">
        {/* Rating stars */}
        <div className="bg-s1 rounded-2xl p-4 border border-white/[0.08]">
          <div className="text-sm font-semibold text-center">Rate this title</div>
          <div className="flex justify-center gap-1.5 mt-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(mediaId, n)}
                className={`transition-colors ${
                  currentRate >= n ? "text-am" : "text-s3 hover:text-am/50"
                }`}
              >
                <Star size={30} fill="currentColor" />
              </button>
            ))}
          </div>
        </div>

        {/* User review submission */}
        <div className="bg-s1 rounded-2xl p-4 border border-white/[0.08]">
          <textarea
            value={reviewInput}
            onChange={(e) => setReviewInput(e.target.value)}
            placeholder="Share your thoughts on this title..."
            className="w-full min-h-[76px] bg-bg border border-white/[0.08] rounded-xl p-2.5 text-white text-[13px] font-sans placeholder-[#6B7280] focus:outline-none focus:border-am resize-y"
          />
          <div className="flex justify-end mt-2.5">
            <button
              onClick={handlePost}
              className="h-8 px-4 rounded-full bg-s3 font-mono text-xs hover:bg-am hover:text-[#111] transition-colors font-medium cursor-pointer"
            >
              Post review
            </button>
          </div>
          {currentReviews.length > 0 && (
            <div className="space-y-2 mt-3">
              {currentReviews.map((t, ri) => (
                <p
                  key={ri}
                  className="m-0 p-2.5 bg-bg rounded-xl text-[13px] text-gray-300 border border-white/[0.06]"
                >
                  {t}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
