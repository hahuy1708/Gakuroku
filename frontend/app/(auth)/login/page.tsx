// app/(auth)/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
	const router = useRouter();
	const { isLoggedIn, login, hasHydrated } = useAuthStore();

	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	useEffect(() => {
		if (hasHydrated && isLoggedIn) router.replace("/dashboard");
	}, [hasHydrated, isLoggedIn, router]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			const ok = login(username.trim(), password);
			if (!ok) {
				setError("Invalid credentials.");
				return;
			}
			router.replace("/dashboard");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
			<div className="mb-6">
				<div className="flex items-center gap-2">
					<div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
						G
					</div>
					<h1 className="text-xl font-bold text-slate-900">Gakuroku</h1>
				</div>
				<p className="text-sm text-slate-500 mt-2">Sign in to access full features.</p>
			</div>

			<form onSubmit={onSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
					<input
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						type="text"
						className="w-full p-3 bg-slate-100 rounded-xl outline-none border border-transparent focus:border-slate-300"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
					<input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full p-3 bg-slate-100 rounded-xl outline-none border border-transparent focus:border-slate-300"
						type="password"
					/>
				</div>

				{error && (
					<div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
						{error}
					</div>
				)}

				<button
					disabled={submitting}
					className="w-full bg-slate-800 text-white py-3 px-4 rounded-xl hover:bg-slate-700 disabled:opacity-60 transition-colors"
					type="submit"
				>
					{submitting ? "Signing in..." : "Sign in"}
				</button>

				
			</form>
		</div>
	);
}

