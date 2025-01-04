// components/sidebar/Sidebar.tsx
"use client";

import { useSidebarStore } from "@/store/useSidebarStore";
import {
  X,
  BookmarkCheck,
  MapPin,
  Settings,
  FileText,
  Lightbulb,
  History,
  HelpCircle,
  UserCog,
  LogOut,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "../home/Logo";
import { useAuthStore } from "@/store/useAuthStore";

export function Sidebar() {
  const { isOpen, setOpen } = useSidebarStore();
  const { isAuthenticated, signOut } = useAuthStore();

  return (
    <>
      {/* The sidebar is hidden by default */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 transition-opacity z-[1001]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 
          h-screen w-64 
          bg-background border-r 
          transform transition-transform duration-300 ease-in-out 
          z-[1002]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Logo />
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
            <BookmarkCheck className="h-5 w-5" />
            <span>Saved POI</span>
          </button>

          <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
            <MapPin className="h-5 w-5" />
            <span>Saved Location</span>
          </button>
        </div>

        {/* Main functional area for report generation, recommendation, and history management */}
        <div className="p-4 border-t space-y-2">
          <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
            <FileText className="h-5 w-5" />
            <span>Report Generation</span>
          </button>

          <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
            <Lightbulb className="h-5 w-5" />
            <span>Recommendation</span>
          </button>

          <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
            <History className="h-5 w-5" />
            <span>History Management</span>
          </button>
        </div>

        {/* Functional area for help, account management, and sign out */}
        <div className="p-4 border-t space-y-2">
          <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
            <HelpCircle className="h-5 w-5" />
            <span>Help/Guidance</span>
          </button>

          {isAuthenticated ? (
            <>
              <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
                <UserCog className="h-5 w-5" />
                <span>Account Management</span>
              </button>

              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg text-red-500"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                // Process Sign in
              }}
              className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg text-blue-500"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
