// app/(main)/lists/page.tsx
"use client";

import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useLists } from "@/hooks/useLists";
import { ListCard } from "@/components/lists/ListCard";
import { EditListModal } from "@/components/lists/EditListModal";
import { DeleteListModal } from "@/components/lists/DeleteListModal";
import { StudyModal } from "@/components/flashcard/StudyModal";
import type { VocabList } from "@/hooks/useLists";

export default function ListsPage() {
  const [name, setName] = useState("");

  const [editingList, setEditingList] = useState<VocabList | null>(null);
  const [deletingList, setDeletingList] = useState<VocabList | null>(null);
  const [studyList, setStudyList] = useState<VocabList | null>(null);

  const {
    lists,
    isLoading,
    createList,
    isCreating,
    updateList,
    isUpdating,
    deleteList,
    isDeleting,
  } = useLists();

  const canCreate = useMemo(() => name.trim().length > 0, [name]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    await createList(name.trim());
    setName("");
  };

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">My Lists</h1>
          <p className="text-slate-600 mt-2">Create a list and add words from the Dictionary.</p>
          <p className="text-slate-600 mt-2">Study flashcards in your lists.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create new list</h2>
          <form onSubmit={create} className="mt-4 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 p-3 bg-slate-100 rounded-xl outline-none"
              placeholder="e.g. N4 - Food"
            />
            <button
              disabled={!canCreate || isCreating}
              className="bg-slate-800 text-white px-5 rounded-xl hover:bg-slate-700 disabled:opacity-60 transition-colors"
              type="submit"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Your lists</h2>
          {isLoading ? (
            <p className="text-sm text-slate-500 mt-4">Loading...</p>
          ) : lists.length === 0 ? (
            <p className="text-sm text-slate-500 mt-4">No lists yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {lists.map((l) => (
                <ListCard
                  key={l.id}
                  list={l}
                  onEdit={() => setEditingList(l)}
                  onDelete={() => setDeletingList(l)}
                  onStudy={() => setStudyList(l)}
                />
              ))}
            </div>
          )}
        </div>

        <EditListModal
          key={`edit-${editingList?.id ?? "closed"}`}
          open={Boolean(editingList)}
          list={editingList}
          isSubmitting={isUpdating}
          onClose={() => setEditingList(null)}
          onSubmit={async (nextName, nextDescription) => {
            if (!editingList) return;
            await updateList({
              id: editingList.id,
              name: nextName,
              description: nextDescription ?? undefined,
            });
            setEditingList(null);
          }}
        />

        <DeleteListModal
          open={Boolean(deletingList)}
          list={deletingList}
          isSubmitting={isDeleting}
          onClose={() => setDeletingList(null)}
          onConfirm={async () => {
            if (!deletingList) return;
            await deleteList(deletingList.id);
            setDeletingList(null);
          }}
        />

        <StudyModal
          key={`study-${studyList?.id ?? "closed"}`}
          open={Boolean(studyList)}
          listId={studyList?.id ?? null}
          title={studyList?.name}
          onClose={() => setStudyList(null)}
        />
      </div>
    </RequireAuth>
  );
}
