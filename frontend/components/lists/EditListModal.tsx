// components/lists/EditListModal.tsx
"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { VocabList } from "@/hooks/useLists";

export const EditListModal = ({
  open,
  list,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  list: VocabList | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (nextName: string, nextDescription?: string | null) => Promise<void>;
}) => {
  const [name, setName] = useState(() => list?.name ?? "");
  const [description, setDescription] = useState(() => list?.description ?? "");

  const canSave = useMemo(() => name.trim().length > 0 && (name.trim() !== (list?.name ?? "") || description !== (list?.description ?? "")), [name, description, list]);

  if (!open || !list) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 p-4 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-slate-500">Edit list</div>
              <div className="text-lg font-semibold text-slate-900">{list.name}</div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!canSave) return;
              await onSubmit(name.trim(), description || undefined);
            }}
            className="p-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-slate-100 rounded-xl outline-none border border-transparent focus:border-slate-300"
                placeholder="e.g. N3 - Daily"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-100 rounded-xl outline-none border border-transparent focus:border-slate-300"
                placeholder="e.g. Vocabulary for daily conversation"
                rows={3}
              />
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
                type="submit"
                disabled={!canSave || isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
