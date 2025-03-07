// components/sidebar/Sidebar.tsx
"use client";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useRatingStore } from "@/components/ratingSystem/store/ratingStore";
import {
  X,
  BookmarkCheck,
  MapPin,
  Settings,
  FileText,
  Lightbulb,
  History,
  HelpCircle,
  LogOut,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "../home/Logo";
// import { useAuthStore } from "@/stores/useAuthStore";
import RatingReport from "../ratingSystem/ratingReport";
import {
  SignedIn,
  SignInButton,
  SignedOut,
  SignOutButton,
} from "@clerk/nextjs";
import { ArchivePopup } from "./historyManagement/ArchivePopup";
import { SettingsPopup } from "./SettingsPopup";
import { useArchiveStore } from "@/stores/useArchiveStore";
import { set } from "lodash";
import RecommendationPopup from "@/components/recommendation/RecommendationPopup";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
export function Sidebar() {
  const { isOpen, setOpen } = useSidebarStore();

  return (
    <>
      {/* The sidebar is hidden by default */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 transition-opacity z-[1001]"
          onClick={() => {
            setOpen(false);
            useArchiveStore.getState().setArchiveOpen(false);
          }}
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
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4 ">
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
          {/* </div> */}

          {/* Main functional area for report generation, recommendation, and history management */}
          {/* <div className="p-4 border-t space-y-2"> */}
          <button
            onClick={() => {
              useRatingStore.getState().setOpen(true);
              useSidebarStore.getState().setOpen(false);
            }}
            className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
            <FileText className="h-5 w-5" />
            <span>Report Generation</span>
          </button>
          <RatingReport />

          <button
            className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
            onClick={() => {
              useRecommendationStore.getState().setOpen(true);
            }}>
            <Lightbulb className="h-5 w-5" />
            <span>Recommendation</span>
          </button>
          <RecommendationPopup />

          <SignedIn>
            <button
              className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
              onClick={() => {
                useArchiveStore.getState().setArchiveOpen(true);
              }}>
              <History className="h-5 w-5" />
              <span>History Management</span>
            </button>
          </SignedIn>
        </div>

        {/* Functional area for help, Settings and Login Logout */}
        <div className="p-4 border-t space-y-2 mt-auto">
          <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
            <HelpCircle className="h-5 w-5" />
            <span>Help/Guidance</span>
          </button>

          {/* Settings and Login/Logout */}
          <SignedIn>
            <button
              onClick={() => {
                useSettingsStore.getState().setOpen(true);
                useSidebarStore.getState().setOpen(false);
              }}
              className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>

            <SignOutButton>
              <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg text-red-500">
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </SignOutButton>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg text-blue-500">
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </aside>
      <ArchivePopup />
      <SettingsPopup />
    </>
  );
}
