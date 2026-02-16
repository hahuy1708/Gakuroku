"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";

export default function QuizPage() {
  return (
    <RequireAuth>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Quiz</h1>
        <p className="text-slate-600 mt-2">Placeholder page.</p>
      </div>
    </RequireAuth>
  );
}
