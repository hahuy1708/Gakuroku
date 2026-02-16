// app/(main)/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { dictionaryService } from "@/services/dictionary_service";
import { Word } from "@/types/dictionary";
import { WordCard } from "@/components/dictionary/WordCard";
import { Search } from "lucide-react";
import { AddToListModal } from "@/components/lists/AddToListModal";
import { useAuthStore } from "@/store/useAuthStore";

export default function DictionaryPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await dictionaryService.search(keyword);
    setResults(data);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
         <input 
            value={keyword} 
            onChange={e => setKeyword(e.target.value)}
            className="flex-1 p-3 bg-slate-100 rounded-xl outline-none" 
            placeholder="Search for words..."
         />
         <button className="bg-indigo-600 text-white px-6 rounded-xl flex items-center gap-2">
            <Search className="w-4 h-4" />
         </button>
      </form>

      <div className="space-y-4">
        {results.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            onAddClick={(w) => {
              if (!isLoggedIn) {
                router.push("/login");
                return;
              }
              setSelectedWord(w);
            }}
          />
        ))}
      </div>

      <AddToListModal
        key={selectedWord?.id ?? "closed"}
        open={Boolean(selectedWord)}
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </div>
  );
}