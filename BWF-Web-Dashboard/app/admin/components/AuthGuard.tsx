"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role  = localStorage.getItem("userRole");
    const onLoginPage = pathname?.startsWith("/admin/login");

    if (!onLoginPage && (!token || role !== "admin")) {
      router.replace("/admin/login");
      return;
    }

    if (onLoginPage && token && role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  // Show nothing while redirecting or checking auth
  if (!ready) return null;

  return <>{children}</>;
}
