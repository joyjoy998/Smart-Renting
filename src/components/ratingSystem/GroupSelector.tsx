import { useState, useEffect } from "react";
import { useRatingStore } from "@/stores/ratingStore";
import { useGroupIdStore } from "@/stores/useGroupStore";
import { useGroupSelectorStore } from "@/stores/useGroupSelectorStore";
import { useAuth } from "@clerk/nextjs";

export default function GroupSelector() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loadData } = useRatingStore();
  const [insufficientData, setInsufficientData] = useState(false);
  const { isSignedIn } = useAuth();
  const { currentGroupId } = useGroupIdStore();
  const { setOpen: setGroupSelectorOpen } = useGroupSelectorStore();

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
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Insufficient Data</h2>
        <p className="text-gray-700 mb-6">
          Your current group doesn't have enough properties or POIs to generate
          a report. <br />
          <br />
          Please ensure at least <strong>2 properties</strong> and{" "}
          <strong>1 POI</strong>.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    );
  } else if (!isSignedIn) {
    content = (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800">Sign In Required</h3>
        <p className="mt-2 text-blue-700">
          Please sign in to generate property comparison reports.
        </p>
      </div>
    );
  } else if (loading) {
    content = (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Generating your report...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  } else {
    content = (
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Generating Report</h2>
        <p className="text-gray-600 mb-4">
          Preparing your property comparison report for the current group...
        </p>
      </div>
    );
  }
  return content;
}
