// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookA, LayoutDashboard, Library, BrainCircuit } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  const navItems = [
    { name: "Dictionary", path: "/", icon: <BookA size={20} />, requiresAuth: false },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} />, requiresAuth: true },
    { name: "My Lists", path: "/lists", icon: <Library size={20} />, requiresAuth: true },
    { name: "Quiz", path: "/quiz", icon: <BrainCircuit size={20} />, requiresAuth: true },
  ];

  const handleNavigation = (e: React.MouseEvent, path: string, requiresAuth: boolean) => {
    if (requiresAuth && !isLoggedIn) {
      e.preventDefault();
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="mb-8 px-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Gakuroku</h1>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={(e) => handleNavigation(e, item.path, item.requiresAuth)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.icon}
              {item.name}
              
              
            </Link>
          );
        })}
      </nav>
    </div>
  );
};