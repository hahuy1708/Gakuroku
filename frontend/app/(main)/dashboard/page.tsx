// app/(main)/dashboard/page.tsx
"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { ActivityHeatmap } from "@/components/dashboard/Heatmap";
import { statsService } from "@/services/stats_service";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
	const heatmapQuery = useQuery({
		queryKey: ["stats", "heatmap"],
		queryFn: () => statsService.getHeatmap(),
	});

	const overviewQuery = useQuery({
		queryKey: ["stats", "overview"],
		queryFn: () => statsService.getOverview(),
	});

	return (
		<RequireAuth>
			<div className="space-y-4">
				<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
					<h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
					<p className="text-slate-600 mt-2">Track your learning progress.</p>
				</div>

				<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
					<div className="text-sm font-semibold text-slate-900">Overview</div>

					{overviewQuery.isLoading ? (
						<div className="mt-3 text-sm text-slate-500">Loading...</div>
					) : overviewQuery.isError ? (
						<div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
							Could not load overview data.
						</div>
					) : (
						<div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
							<div className="border border-slate-200 rounded-2xl p-4">
								<div className="text-xs text-slate-500">Total reviews</div>
								<div className="mt-1 text-2xl font-bold text-slate-900">
									{overviewQuery.data?.total_reviews ?? 0}
								</div>
							</div>
							<div className="border border-slate-200 rounded-2xl p-4">
								<div className="text-xs text-slate-500">Mastered words</div>
								<div className="mt-1 text-2xl font-bold text-slate-900">
									{overviewQuery.data?.mastered_words ?? 0}
								</div>
							</div>
							<div className="border border-slate-200 rounded-2xl p-4">
								<div className="text-xs text-slate-500">Current streak</div>
								<div className="mt-1 text-2xl font-bold text-slate-900">
									{overviewQuery.data?.current_streak ?? 0}
								</div>
							</div>
							<div className="border border-slate-200 rounded-2xl p-4">
								<div className="text-xs text-slate-500">Longest streak</div>
								<div className="mt-1 text-2xl font-bold text-slate-900">
									{overviewQuery.data?.longest_streak ?? 0}
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between gap-2">
						<div className="text-sm font-semibold text-slate-900">Activity</div>
						<div className="text-xs text-slate-500">365 days recent</div>
					</div>

					{heatmapQuery.isLoading ? (
						<div className="mt-3 text-sm text-slate-500">Loading...</div>
					) : heatmapQuery.isError ? (
						<div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
							Could not load heatmap.
						</div>
					) : (
						<div className="mt-4 overflow-x-auto">
							<ActivityHeatmap data={heatmapQuery.data ?? []} />
						</div>
					)}
				</div>
			</div>
		</RequireAuth>
	);
}

