// components/lists/ListCard.tsx
"use client";

import { Pencil, Trash2, GraduationCap } from "lucide-react";
import type { VocabList } from "@/hooks/useLists";

export const ListCard = ({
  list,
  onEdit,
  onDelete,
  onStudy,
}: {
  list: VocabList;
  onEdit: () => void;
  onDelete: () => void;
  onStudy: () => void;
}) => {
  return (
    <div
      className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
    >
      <button
        type="button"
        onClick={onStudy}
        className="flex-1 text-left"
      >
        <div className="font-semibold text-slate-900">{list.name}</div>
        <div className="text-xs text-slate-500">{list.count || 0} cards</div>
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2"
        >
          <Pencil size={16} />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Delete</span>
        </button>
        <button
          type="button"
          onClick={onStudy}
          className="px-3 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 flex items-center gap-2"
        >
          <GraduationCap size={16} />
          <span className="hidden sm:inline">Study</span>
        </button>
      </div>
    </div>
  );
};
