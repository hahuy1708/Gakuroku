// components/lists/DeleteListModal.tsx
"use client";

import { X } from "lucide-react";
import type { VocabList } from "@/hooks/useLists";

export const DeleteListModal = ({
  open,
  list,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  list: VocabList | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) => {
  if (!open || !list) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 p-4 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-slate-500">Delete list</div>
              <div className="text-lg font-semibold text-slate-900">{list.name}</div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="text-sm text-slate-700">
              Are you sure you want to delete this list? This will also remove its flashcards.
            </div>
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
                disabled={isSubmitting}
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
