"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import AuthGuard from "./components/AuthGuard";
import { Menu } from "lucide-react";

export default function WardenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="bg-gray-50 min-h-screen">
        {/* Mobile Topbar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <h1 className="font-semibold text-gray-900">Warden Portal</h1>
          <button onClick={() => setOpen(true)}>
            <Menu className="text-black" />
          </button>
        </div>

        {/* Overlay (mobile) */}
        {open && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-screen w-64 bg-white z-50 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
        >
          <Sidebar closeSidebar={() => setOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="p-6 md:p-8 md:ml-64">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}