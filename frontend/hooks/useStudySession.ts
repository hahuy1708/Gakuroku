// hooks/useStudySession.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const useStudySession = (listId: number | null) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);

  const enabled = typeof listId === "number" && listId > 0;
  const queryClient = useQueryClient();
  const flashcardsQueryKey = useMemo(() => ["flashcards", listId], [listId]);

  const {
    data: cards = [],
    isLoading,
    isError,
  } = useQuery<Flashcard[]>({
    queryKey: flashcardsQueryKey,
    queryFn: () => flashcardService.getCardsInList(listId as number),
    enabled,
  });

  const orderedCards = useMemo(() => {
    if (!isShuffled) return cards;
    if (shuffleOrder.length === 0) return cards;

    const byId = new Map(cards.map((c) => [c.id, c] as const));
    const used = new Set<number>();
    const shuffled: Flashcard[] = [];

    for (const id of shuffleOrder) {
      const card = byId.get(id);
      if (!card) continue;
      used.add(id);
      shuffled.push(card);
    }

    for (const c of cards) {
      if (!used.has(c.id)) shuffled.push(c);
    }

    return shuffled;
  }, [cards, isShuffled, shuffleOrder]);

  const total = orderedCards.length;

  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1);

  const current = useMemo(() => {
    if (orderedCards.length === 0) return null;
    return orderedCards[safeIndex] ?? null;
  }, [orderedCards, safeIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((v) => !v);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setIndex(() => {
      if (total === 0) return 0;
      return Math.min(safeIndex + 1, total - 1);
    });
  }, [safeIndex, total]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setIndex(() => Math.max(safeIndex - 1, 0));
  }, [safeIndex]);

  const toggleShuffle = useCallback(() => {
    setIsFlipped(false);

    setIsShuffled((prev) => {
      const next = !prev;
      if (next) {
        const order = fisherYatesShuffle(cards.map((c) => c.id));
        setShuffleOrder(order);
        setIndex(0);
      } else {
        setShuffleOrder([]);
      }
      return next;
    });
  }, [cards]);

  const markMutation = useMutation({
    mutationFn: async (vars: { cardId: number; status: boolean; note: string }) => {
      return flashcardService.updateCard(vars.cardId, vars.status, vars.note);
    },
    onMutate: async (vars) => {
      if (!enabled) return { previous: undefined as Flashcard[] | undefined };

      await queryClient.cancelQueries({ queryKey: flashcardsQueryKey });
      const previous = queryClient.getQueryData<Flashcard[]>(flashcardsQueryKey);

      queryClient.setQueryData<Flashcard[]>(flashcardsQueryKey, (old) => {
        const current = old ?? [];
        return current.map((c) =>
          c.id === vars.cardId ? { ...c, is_memorized: vars.status } : c
        );
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(flashcardsQueryKey, ctx.previous);
      }
    },
    onSettled: () => {
      if (enabled) {
        queryClient.invalidateQueries({ queryKey: flashcardsQueryKey });
      }
    },
  });

  const markAsMemorized = useCallback(
    async (cardId: number, status: boolean) => {
      const note =
        orderedCards.find((c) => c.id === cardId)?.note ??
        queryClient
          .getQueryData<Flashcard[]>(flashcardsQueryKey)
          ?.find((c) => c.id === cardId)?.note ??
        "";

      await markMutation.mutateAsync({
        cardId,
        status,
        note: note ?? "",
      });
    },
    [flashcardsQueryKey, markMutation, orderedCards, queryClient]
  );

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tag === "input" ||
        tag === "textarea" ||
        Boolean(target && target.isContentEditable);

      if (isTypingTarget) return;
      if (!current) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
        return;
      }

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handleFlip();
        return;
      }

      if (e.key === "1") {
        e.preventDefault();
        void markAsMemorized(current.id, false);
        return;
      }

      if (e.key === "2") {
        e.preventDefault();
        void markAsMemorized(current.id, true);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, enabled, handleFlip, handleNext, handlePrev, markAsMemorized]);

  return {
    cards: orderedCards,
    current,
    index: safeIndex,
    total,
    isFlipped,
    isShuffled,
    isLoading,
    isError,
    isMarking: markMutation.isPending,
    handleFlip,
    handleNext,
    handlePrev,
    toggleShuffle,
    markAsMemorized,
    setIndex,
    setIsFlipped,
  };
};
