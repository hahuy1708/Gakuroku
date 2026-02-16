// app/(main)/dashboard/page.tsx
"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DashboardPage() {
	return (
		<RequireAuth>
			<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
				<p className="text-slate-600 mt-2">
					This is the dashboard page.
				</p>
			</div>
		</RequireAuth>
	);
}

