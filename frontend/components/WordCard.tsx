import { Word } from "@/types/dictionary";
import { POS_MAP } from "@/constants/pos_map";

export const WordCard = ({ word }: { word: Word }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-end gap-4 mb-4">
        <div className="flex flex-col">
          {word.kanji && <span className="text-slate-500 text-sm">{word.kana}</span>}
          <h2 className="text-4xl font-bold">{word.kanji || word.kana}</h2>
        </div>
        {word.is_common && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Common</span>}
      </div>
      
      <div className="space-y-4 pt-4 border-t border-slate-50">
        {word.senses.map((sense, idx) => (
          <div key={idx} className="pl-4 border-l-2 border-slate-100">
            <div className="flex gap-1 mb-1">
              {sense.parts_of_speech.map(pos => (
                <span key={pos} className="text-[10px] bg-slate-100 px-1.5 rounded">{POS_MAP[pos] || pos}</span>
              ))}
            </div>
            <p className="text-slate-700">{sense.glosses.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
};