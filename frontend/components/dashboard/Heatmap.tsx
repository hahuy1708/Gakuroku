// components/dashboard/Heatmap.tsx
"use client";

import { HEATMAP_COLORS, getHeatmapColor } from "@/constants/heatmap_color";

export type HeatmapDataPoint = {
	date: string; // YYYY-MM-DD
	count: number;
};

function formatLocalYYYYMMDD(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

export function generateLast365Days(): string[] {
	const today = new Date();
	const out: string[] = [];
	for (let i = 364; i >= 0; i--) {
		const d = new Date(today);
		d.setDate(today.getDate() - i);
		out.push(formatLocalYYYYMMDD(d));
	}
	return out;
}

export function ActivityHeatmap({ data }: { data: HeatmapDataPoint[] }) {
	const days = generateLast365Days();
	const map = new Map<string, number>();
	for (const item of data) {
		map.set(item.date, item.count);
	}

	const merged = days.map((date) => ({
		date,
		count: map.get(date) ?? 0,
	}));

	return (
		<div className="grid grid-rows-7 grid-flow-col gap-1">
			{merged.map((d) => (
				<div
					key={d.date}
					title={`${d.date}: ${d.count} reviews`}
					className="h-3 w-3 rounded-[3px] border"
					style={{
						backgroundColor: getHeatmapColor(d.count),
						borderColor: HEATMAP_COLORS.border,
					}}
				/>
			))}
		</div>
	);
}