"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { DarkModeToggle } from "@/components/DarkModeToggle";

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
  // Default to true (collapsed) as requested
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-900 font-mono text-sm tracking-widest uppercase animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className={`border-r border-slate-200/50 bg-white hidden md:flex flex-col py-4 pt-2 sticky top-0 h-screen z-50 transition-all duration-300 ${isCollapsed ? "w-[4.5rem] px-2" : "w-64 px-4"}`}>
        <div className={`mb-6 mt-2 flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-1"}`}>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 transition-colors focus:outline-none flex-shrink-0"
            title="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {!isCollapsed && (
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
              <img src="/logo.png" alt="Logo" className="h-30 w-auto object-contain" />
            </span>
          )}
        </div>
        <nav className="flex-1 space-y-2 mt-4 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activePage;
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center ${isCollapsed ? "justify-center aspect-square px-0" : "gap-3 px-4 py-3"} rounded-xl transition-all duration-200 font-medium ${isActive
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-100/30 border border-transparent"
                  }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-200/50 pt-4 mt-auto overflow-hidden flex flex-col gap-2">
          <DarkModeToggle 
            showLabel={!isCollapsed} 
            iconSize="w-4 h-4"
            className={`w-full flex items-center justify-center ${isCollapsed ? "px-0 aspect-square" : "gap-2 px-5 py-2.5"} bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl transition-all`} 
          />
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center ${isCollapsed ? "px-0 aspect-square" : "gap-2 px-5 py-2.5"} bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl transition-all`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="text-sm whitespace-nowrap overflow-hidden">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 border-b border-slate-200/50 p-4 flex justify-between items-center bg-slate-50/80 backdrop-blur-md z-50">
        <span className="font-bold text-slate-900">skillwallet.</span>
        <div className="flex gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={`text-xs px-3 py-1.5 rounded-lg ${item.key === activePage ? "bg-blue-500/20 text-blue-400" : "bg-slate-100 text-slate-500"
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
