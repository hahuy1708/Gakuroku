// components/flashcard/FlashcardItem.tsx
"use client";

import type { ReactNode } from "react";

export const FlashcardItem = ({
  front,
  back,
  isFlipped,
  onToggle,
}: {
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="perspective-1000 w-full">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
      >
        <div
          className={
            "relative w-full min-h-[320px] transform-style-3d transition-transform duration-500" +
            (isFlipped ? " rotate-y-180" : "")
          }
        >
          <div className="absolute inset-0 backface-hidden">
            <div className="w-full min-h-[320px] bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-center">
              {front}
            </div>
          </div>

          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="w-full min-h-[320px] bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              {back}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
