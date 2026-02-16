// components/flashcard/StudyModal.tsx
"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { FlashcardItem } from "@/components/flashcard/FlashcardItem";
import { useStudySession } from "@/hooks/useStudySession";

export const StudyModal = ({
  open,
  listId,
  title,
  onClose,
}: {
  open: boolean;
  listId: number | null;
  title?: string;
  onClose: () => void;
}) => {
  const session = useStudySession(open ? listId : null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 p-4 md:p-10 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-slate-500">Study</div>
              <div className="text-lg font-semibold text-slate-900">{title || "Flashcards"}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 md:p-6 space-y-4">
            {session.isLoading ? (
              <div className="text-sm text-slate-500">Loading flashcards...</div>
            ) : session.isError ? (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                Failed to load flashcards.
              </div>
            ) : session.total === 0 ? (
              <div className="text-sm text-slate-500">This list has no flashcards yet.</div>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div>
                    Card {session.index + 1} / {session.total}
                  </div>
                  <div className="text-xs text-slate-500">Click card to flip</div>
                </div>

                <FlashcardItem
                  isFlipped={session.isFlipped}
                  onToggle={session.flip}
                  front={
                    <div className="text-center">
                      <div className="text-4xl font-bold text-slate-900">
                        {session.current?.word_data.kanji || session.current?.word_data.kana}
                      </div>
                      {session.current?.word_data.kanji && (
                        <div className="mt-2 text-sm text-slate-500">
                          {session.current?.word_data.kana}
                        </div>
                      )}
                    </div>
                  }
                  back={
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-900">Meaning</div>
                      <div className="space-y-2">
                        {(session.current?.word_data.senses || []).slice(0, 4).map((s, i) => (
                          <div key={i} className="text-sm text-slate-700">
                            {s.glosses.join(", ")}
                          </div>
                        ))}
                      </div>
                      {session.current?.note ? (
                        <div className="pt-3 border-t border-slate-200">
                          <div className="text-xs text-slate-500">Note</div>
                          <div className="text-sm text-slate-700">{session.current.note}</div>
                        </div>
                      ) : null}
                    </div>
                  }
                />

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={session.prev}
                    disabled={session.index === 0}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={session.next}
                    disabled={session.index >= session.total - 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
