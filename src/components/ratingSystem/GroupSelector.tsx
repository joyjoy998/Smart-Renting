import { useState, useEffect } from "react";
import { useRatingStore } from "@/stores/ratingStore";
import { useGroupIdStore } from "@/stores/useGroupStore";
import { useGroupSelectorStore } from "@/stores/useGroupSelectorStore";
import { useAuth } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function GroupSelector() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loadData } = useRatingStore();
  const [insufficientData, setInsufficientData] = useState(false);
  const { isSignedIn } = useAuth();
  const { currentGroupId } = useGroupIdStore();
  const { setOpen: setGroupSelectorOpen } = useGroupSelectorStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    if (!currentGroupId) {
      setLoading(false);
      setError("No active group found. Please create a group first.");
      return;
    }

    generateReport(currentGroupId);
  }, [isSignedIn, currentGroupId]);

  const generateReport = async (currentGroupId: number) => {
    try {
      setLoading(true);
      setError(null);
      setInsufficientData(false);

      const response = await fetch(
        `/api/getSavedGroupsByID?groupId=${currentGroupId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group details");
      }

      const result = await response.json();

      if (result.success) {
        const { properties, pois } = result.data;

        // Check if the data is sufficient for generating a report
        if (properties.length < 2 || pois.length < 1) {
          setInsufficientData(true);
          setLoading(false);
          return;
        }

        await loadData(result.data);
        useRatingStore.getState().setOpen(true);
        setGroupSelectorOpen(false);
      } else {
        setError("Failed to load group data");
      }
    } catch (err) {
      setError("Error generating report. Please try again.");
      console.error("Error getting report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (currentGroupId) {
      generateReport(currentGroupId);
    } else {
      setError(
        "No active group found. Please select a group in the map first."
      );
    }
  };

  const handleClose = () => {
    setGroupSelectorOpen(false);
  };

  let content;

  if (insufficientData) {
    content = (
      <div
        className={cn(
          "rounded-lg p-6",
          isDark ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        )}
      >
        <h2
          className={cn(
            "text-xl font-semibold mb-4",
            isDark ? "text-gray-100" : "text-gray-800"
          )}
        >
          Insufficient Data
        </h2>
        <p className={cn("mb-6", isDark ? "text-gray-300" : "text-gray-700")}>
          Your current group doesn't have enough properties or POIs to generate
          a report. <br />
          <br />
          Please ensure at least <strong>2 properties</strong> and{" "}
          <strong>1 POI</strong>.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className={cn(
              "px-4 py-2 border rounded-md",
              isDark
                ? "border-gray-600 hover:bg-gray-700 text-gray-200"
                : "border-gray-300 hover:bg-gray-50 text-gray-800"
            )}
          >
            Close
          </button>
        </div>
      </div>
    );
  } else if (!isSignedIn) {
    content = (
      <div
        className={cn(
          "border rounded-lg p-6",
          isDark
            ? "bg-blue-900/30 border-blue-800 text-blue-300"
            : "bg-blue-50 border-blue-200 text-blue-800"
        )}
      >
        <h3
          className={cn(
            "text-lg font-medium",
            isDark ? "text-blue-300" : "text-blue-800"
          )}
        >
          Sign In Required
        </h3>
        <p className={cn("mt-2", isDark ? "text-blue-400" : "text-blue-700")}>
          Please sign in to generate property comparison reports.
        </p>
      </div>
    );
  } else if (loading) {
    content = (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
        <div
          className={cn(
            "w-16 h-16 border-4 rounded-full animate-spin",
            isDark
              ? "border-gray-700 border-t-blue-400"
              : "border-gray-300 border-t-blue-500"
          )}
        ></div>
        <p className={cn("mt-4", isDark ? "text-gray-400" : "text-gray-600")}>
          Generating your report...
        </p>
      </div>
    );
  } else if (error) {
    content = (
      <div
        className={cn(
          "border rounded-lg p-6",
          isDark
            ? "bg-red-900/30 border-red-800 text-red-300"
            : "bg-red-50 border-red-200 text-red-800"
        )}
      >
        <h3
          className={cn(
            "text-lg font-medium",
            isDark ? "text-red-300" : "text-red-800"
          )}
        >
          Error
        </h3>
        <p className={cn("mt-2", isDark ? "text-red-400" : "text-red-700")}>
          {error}
        </p>
        <button
          onClick={handleRetry}
          className={cn(
            "mt-4 px-4 py-2 rounded",
            isDark
              ? "bg-red-800 hover:bg-red-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          Try Again
        </button>
      </div>
    );
  } else {
    content = (
      <div
        className={cn(
          "rounded-lg p-6",
          isDark ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        )}
      >
        <h2
          className={cn(
            "text-xl font-semibold mb-4",
            isDark ? "text-gray-100" : "text-gray-800"
          )}
        >
          Generating Report
        </h2>
        <p className={cn("mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
          Preparing your property comparison report for the current group...
        </p>
      </div>
    );
  }
  return content;
}
