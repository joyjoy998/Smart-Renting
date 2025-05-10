// components/sidebar/Sidebar.tsx
"use client";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useRatingStore } from "@/stores/ratingStore";
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
import GuidedTour from "@/components/sidebar/guidance/GuidedTour";
import { GroupPopup } from "./groupManagement/GroupPopup";
import { SettingsPopup } from "./SettingsPopup";
import { useArchiveStore } from "@/stores/useArchiveStore";
import SavePoiModal from "./SavePoi";
import SavedPropertyModal from "./SavedProperty";
import RecommendationPopup from "@/components/recommendation/RecommendationPopup";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import GroupSelector from "@/components/ratingSystem/GroupSelector";
import { useGroupSelectorStore } from "../../stores/useGroupSelectorStore";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { isOpen, setOpen } = useSidebarStore();
  const { isOpen: groupSelectorOpen, setOpen: setGroupSelectorOpen } =
    useGroupSelectorStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        `}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4 ">
            <Logo />
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <SignedIn>
            <button
              id="archive-management"
              className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
              onClick={() => {
                useArchiveStore.getState().setArchiveOpen(true);
              }}
            >
              <History className="h-5 w-5" />
              <span>Group Management</span>
            </button>

            <SavePoiModal />

            <SavedPropertyModal />
            {/* </div> */}

            {/* Main functional area for report generation, recommendation, and history management */}
            {/* <div className="p-4 border-t space-y-2"> */}
            <button
              id="comparison-report"
              onClick={() => {
                //useSidebarStore.getState().setOpen(false);
                useRatingStore.getState().setOpen(false);
                useGroupSelectorStore.getState().setOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
            >
              <FileText className="h-5 w-5" />
              <span>Comparison Report</span>
            </button>

            <button
              id="recommendation"
              className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
              onClick={() => {
                useRecommendationStore.getState().setOpen(true);
              }}
            >
              <Lightbulb className="h-5 w-5" />
              <span>Recommendation</span>
            </button>
            <RecommendationPopup />
          </SignedIn>
        </div>

        {/* Functional area for help, Settings and Login Logout */}
        <div className="p-4 border-t space-y-2 mt-auto">
          <SignedIn>
            <GuidedTour />

            {/* Settings and Login/Logout */}

            <button
              id="settings"
              onClick={() => {
                useSettingsStore.getState().setOpen(true);
                useSidebarStore.getState().setOpen(false);
              }}
              className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>

            <SignOutButton>
              <button
                className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg text-red-500"
                onClick={() => {
                  useSidebarStore.getState().setOpen(false);
                }}
              >
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
      <GroupPopup />
      <SettingsPopup />
      <RatingReport />

      {/* Group Selector Modal */}
      {groupSelectorOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/30 flex items-center justify-center">
          <div
            className={cn(
              "rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative",
              isDark
                ? "bg-gray-800 text-gray-200 border border-gray-700 shadow-lg shadow-blue-900/20"
                : "bg-white text-gray-800"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={cn(
                "absolute top-2 right-2 p-1 rounded-full hover:bg-opacity-20",
                isDark
                  ? "text-gray-300 hover:bg-gray-600"
                  : "text-gray-500 hover:bg-gray-200"
              )}
              onClick={() => setGroupSelectorOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <GroupSelector />
          </div>
        </div>
      )}
    </>
  );
}
