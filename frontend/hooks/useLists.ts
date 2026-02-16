// hooks/useLists.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flashcardService } from "@/services/flashcard_service";

export type VocabList = {
  id: number;
  name: string;
  description?: string | null;
  count?: number;
};

export const useLists = () => {
  const queryClient = useQueryClient();

  const { data: lists = [], isLoading } = useQuery<VocabList[]>({
    queryKey: ["vocabLists"],
    queryFn: () => flashcardService.getLists(),
  });

  const { mutateAsync: createList, isPending: isCreating } = useMutation({
    mutationFn: (name: string) => flashcardService.createList(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabLists"] });
    },
  });

  const { mutateAsync: updateList, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, name, description }: { id: number; name: string; description?: string | null }) =>
      flashcardService.updateList(id, name, description || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabLists"] });
    },
  });

  const { mutateAsync: deleteList, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => flashcardService.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabLists"] });
    },
  });

  return {
    lists,
    isLoading,
    createList,
    isCreating,
    updateList,
    isUpdating,
    deleteList,
    isDeleting,
  };
};
