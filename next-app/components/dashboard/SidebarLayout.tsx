"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

const NAV_ITEMS = [
  {
    key: "profile",
    label: "Profile",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: "explore",
    label: "Explore",
    href: "/explore",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    key: "jobs",
    label: "Jobs",
    href: "/jobs",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
] as const;

export default function SidebarLayout({
  activePage,
  children,
}: {
  activePage: "profile" | "explore" | "jobs";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { logout, user, loading: authLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      router.push("/");
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090d14]">
        <div className="text-white font-mono text-sm tracking-widest uppercase animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090d14] text-gray-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800/50 bg-[#0d1117] hidden md:flex flex-col p-6 sticky top-0 h-screen z-50">
        <div className="mb-10 pl-2">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight cursor-pointer hover:opacity-80 transition-opacity block">
            SKILL WALLET
          </Link>
        </div>
        <nav className="flex-1 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activePage;
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "text-gray-500 hover:text-white hover:bg-gray-800/30"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-gray-800/50 pt-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm bg-[#161b22] hover:bg-gray-800 border border-gray-700 text-gray-300 px-5 py-2.5 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 border-b border-gray-800/50 p-4 flex justify-between items-center bg-[#090d14]/80 backdrop-blur-md z-50">
        <Link href="/" className="font-bold text-white hover:text-gray-300 transition-colors">skillwallet.</Link>
        <div className="flex gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={`text-xs px-3 py-1.5 rounded-lg ${
                item.key === activePage ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen md:pt-0 pt-16">
        {children}
      </main>
    </div>
  );
}
