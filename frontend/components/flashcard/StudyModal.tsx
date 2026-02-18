// components/flashcard/StudyModal.tsx
"use client";

import { X, ChevronLeft, ChevronRight, Shuffle, Check } from "lucide-react";
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

  const memorizedCount = session.cards.reduce((acc, c) => acc + (c.is_memorized ? 1 : 0), 0);
  const notMemorizedCount = Math.max(session.cards.length - memorizedCount, 0);

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
              onClick={session.toggleShuffle}
              className={
                "p-2 rounded-xl hover:bg-slate-100 transition-colors " +
                (session.isShuffled ? "text-indigo-600" : "text-slate-600")
              }
              aria-label="Shuffle"
              title="Shuffle"
            >
              <Shuffle size={18} />
            </button>

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
                    {session.isFinished ? "Completed" : `Card ${session.index + 1} / ${session.total}`}
                  </div>
                  <div className="text-xs text-slate-500">
                    {session.isFinished
                      ? "Enter to restart"
                      : "Space to flip • ←/→ to navigate"}
                  </div>
                </div>

                <div className="relative">
                  <div
                    className={
                      "transition-all duration-200 " +
                      (session.isFinished
                        ? "opacity-0 -translate-y-1 pointer-events-none h-0 overflow-hidden"
                        : "opacity-100 translate-y-0")
                    }
                  >
                    <div className="relative">
                      {session.current?.is_memorized ? (
                        <div className="pointer-events-none absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <Check size={14} />
                            Learned
                          </span>
                        </div>
                      ) : null}

                      <FlashcardItem
                        isFlipped={session.isFlipped}
                        onToggle={session.handleFlip}
                        front={
                          <div className="flex items-center justify-center">
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
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={session.handlePrev}
                          disabled={session.index === 0}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 flex items-center gap-2"
                        >
                          <ChevronLeft size={16} />
                          Prev
                        </button>
                        <button
                          type="button"
                          onClick={session.handleNext}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 flex items-center gap-2"
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={!session.current || session.isMarking}
                          onClick={() => {
                            if (!session.current) return;
                            void session.markAsMemorized(session.current.id, false);
                          }}
                          className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          <X size={16} />
                          <span className="font-semibold">Not learned</span>
                          <span className="text-xs text-slate-500">(1)</span>
                        </button>
                        <button
                          type="button"
                          disabled={!session.current || session.isMarking}
                          onClick={() => {
                            if (!session.current) return;
                            void session.markAsMemorized(session.current.id, true);
                          }}
                          className="px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          <Check size={16} />
                          <span className="font-semibold">Learned</span>
                          <span className="text-xs text-emerald-100">(2)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={
                      "transition-all duration-200 " +
                      (session.isFinished
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-1 pointer-events-none h-0 overflow-hidden")
                    }
                  >
                    <div className="border border-slate-200 rounded-2xl bg-white p-6 md:p-8">
                      <div className="text-xl font-semibold text-slate-900">
                        Congrats! You've completed this list.
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        Quick summary of your recent study session.
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                          <Check size={16} />
                          <span className="text-sm font-semibold">Learned</span>
                          <span className="text-sm">{memorizedCount}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                          <X size={16} />
                          <span className="text-sm font-semibold">Not learned</span>
                          <span className="text-sm">{notMemorizedCount}</span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={session.resetSession}
                          className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                          <span className="font-semibold">Review from start</span>
                          <span className="text-xs text-slate-500">(Enter)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!session.isShuffled) session.toggleShuffle();
                            session.resetSession();
                          }}
                          className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                          <Shuffle size={16} />
                          <span className="font-semibold">Shuffle and review</span>
                        </button>

                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-2"
                        >
                          <X size={16} />
                          <span className="font-semibold">Close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
