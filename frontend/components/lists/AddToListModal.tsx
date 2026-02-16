// components/lists/AddToListModal.tsx
"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLists } from "@/hooks/useLists";
import { flashcardService } from "@/services/flashcard_service";
import type { Word } from "@/types/dictionary";

export const AddToListModal = ({
  open,
  word,
  onClose,
}: {
  open: boolean;
  word: Word | null;
  onClose: () => void;
}) => {
  const { lists, isLoading } = useLists();
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { mutateAsync: addToList, isPending } = useMutation({
    mutationFn: ({ listId, entryId }: { listId: number; entryId: string }) =>
      flashcardService.addCardToList(listId, entryId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vocabLists"] });
      queryClient.invalidateQueries({ queryKey: ["flashcards", variables.listId] });
    },
  });

  const canAdd = useMemo(
    () => Boolean(word?.id) && typeof selectedListId === "number" && selectedListId > 0,
    [selectedListId, word]
  );

  if (!open || !word) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 p-4 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-slate-500">Add to list</div>
              <div className="text-lg font-semibold text-slate-900">
                {word.kanji || word.kana}
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="text-sm text-slate-500">Loading lists...</div>
            ) : lists.length === 0 ? (
              <div className="text-sm text-slate-500">You have no lists yet. Create one first.</div>
            ) : (
              <div className="space-y-2">
                {lists.map((l) => {
                  const active = selectedListId === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedListId(l.id)}
                      className={
                        "w-full text-left p-3 rounded-xl border transition-colors " +
                        (active
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 bg-white hover:bg-slate-50")
                      }
                    >
                      <div className="font-semibold text-slate-900">{l.name}</div>
                      <div className="text-xs text-slate-500">{l.count || 0} cards</div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canAdd || isPending}
                onClick={async () => {
                  if (!canAdd) return;
                  await addToList({ listId: selectedListId as number, entryId: word.id });
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {isPending ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
