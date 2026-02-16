// components/auth/RequireAuth.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export const RequireAuth = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoggedIn, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, hasHydrated, router]);

  if (!hasHydrated || !isLoggedIn) return null;

  return <>{children}</>;
};
