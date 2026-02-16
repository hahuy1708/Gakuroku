// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

function titleFromPath(pathname: string) {
	if (pathname === "/") return "Dictionary";
	if (pathname.startsWith("/dashboard")) return "Dashboard";
	if (pathname.startsWith("/lists")) return "My Lists";
	if (pathname.startsWith("/quiz")) return "Quiz";
	return "Gakuroku";
}

export const Header = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { isLoggedIn, user, logout } = useAuthStore();

	return (
		<header className="h-16 border-b border-slate-200 bg-white flex items-center px-4 md:px-8">
			<div className="flex-1">
				<h2 className="text-lg font-semibold text-slate-800">
					{titleFromPath(pathname)}
				</h2>
				<p className="text-xs text-slate-500">Learn Japanese, one word at a time.</p>
			</div>

			<div className="flex items-center gap-2">
				{isLoggedIn ? (
					<>
						<div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
							<div className="w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
								{user?.slice(0, 1)?.toUpperCase()}
							</div>
							<span className="text-sm text-slate-700">{user}</span>
						</div>
						<button
							onClick={() => {
								logout();
								router.push("/");
							}}
							className="px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
							type="button"
						>
							<LogOut size={16} />
							<span className="hidden sm:inline">Logout</span>
						</button>
					</>
				) : (
					<Link
						href="/login"
						className="px-3 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
					>
						<LogIn size={16} />
						<span className="hidden sm:inline">Login</span>
					</Link>
				)}
			</div>
		</header>
	);
};

