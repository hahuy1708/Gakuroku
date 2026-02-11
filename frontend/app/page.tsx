"use client";
import { useState } from "react";
import { dictionaryService } from "@/services/dictionary_service";
import { Word } from "@/types/dictionary";
import { WordCard } from "@/components/WordCard";

export default function DictionaryPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = await dictionaryService.search(keyword);
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
         <input 
            value={keyword} 
            onChange={e => setKeyword(e.target.value)}
            className="flex-1 p-3 bg-slate-100 rounded-xl outline-none" 
            placeholder="Tra từ..."
         />
         <button className="bg-indigo-600 text-white px-6 rounded-xl">Tìm</button>
      </form>

      <div className="space-y-4">
        {results.map((word, i) => <WordCard key={i} word={word} />)}
      </div>
    </div>
  );
}