// hooks/useStudySession.ts
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { flashcardService } from "@/services/flashcard_service";
import type { Word } from "@/types/dictionary";

export type Flashcard = {
  id: number;
  list_id: number;
  entry_id: string;
  note?: string | null;
  is_memorized: boolean;
  word_data: Word;
};

export const useStudySession = (listId: number | null) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const enabled = typeof listId === "number" && listId > 0;

  const {
    data: cards = [],
    isLoading,
    isError,
  } = useQuery<Flashcard[]>({
    queryKey: ["flashcards", listId],
    queryFn: () => flashcardService.getCardsInList(listId as number),
    enabled,
  });

  const total = cards.length;

  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1);

  const current = useMemo(() => {
    if (cards.length === 0) return null;
    return cards[safeIndex] ?? null;
  }, [cards, safeIndex]);

  const flip = () => setIsFlipped((v) => !v);

  const next = () => {
    setIsFlipped(false);
    setIndex(() => {
      if (total === 0) return 0;
      return Math.min(safeIndex + 1, total - 1);
    });
  };

  const prev = () => {
    setIsFlipped(false);
    setIndex(() => Math.max(safeIndex - 1, 0));
  };

  return {
    cards,
    current,
    index: safeIndex,
    total,
    isFlipped,
    isLoading,
    isError,
    flip,
    next,
    prev,
    setIndex,
    setIsFlipped,
  };
};
