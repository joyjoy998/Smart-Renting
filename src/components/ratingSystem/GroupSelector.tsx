import { useState, useEffect } from "react";
import { useRatingStore } from "@/stores/ratingStore";
import { useGroupSelectorStore } from "@/stores/useGroupSelectorStore";
import { useAuth } from "@clerk/nextjs";

interface SavedGroup {
  group_id: number;
  group_name: string;
  created_at: string;
}

export default function GroupSelector() {
  const [groups, setGroups] = useState<SavedGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const { loadData } = useRatingStore();
  const [showInsufficientData, setShowInsufficientData] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/getSavedGroups");
        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }

        const result = await response.json();
        if (result.success && result.data.groups) {
          setGroups(result.data.groups);
        } else {
          setGroups([]);
        }
      } catch (err) {
        setError("Error loading your saved groups. Please try again.");
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [isSignedIn]);

  const handleGroupSelect = (groupId: number) => {
    setSelectedGroupId(groupId);
    setShowReport(false);
  };

  const handleGetReport = async () => {
    if (selectedGroupId) {
      try {
        // fetch selected group details
        const response = await fetch(
          `/api/getSavedGroupsByID?groupId=${selectedGroupId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch group details");
        }

        const result = await response.json();
        if (result.success) {
          const { properties, pois } = result.data;

          if (properties.length < 2 || pois.length < 1) {
            setShowInsufficientData(true);
            return;
          }

          await loadData(result.data);
          useRatingStore.getState().setOpen(true);
          useGroupSelectorStore.getState().setOpen(false);
        } else {
          setError("Failed to load group data");
        }
      } catch (err) {
        setError("Error generating report. Please try again.");
        console.error("Error getting report:", err);
      }
    }
  };

  if (!isSignedIn) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800">Sign In Required</h3>
        <p className="mt-2 text-blue-700">
          Please sign in to view your property groups and generate reports.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading your saved groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800">No Saved Groups</h3>
        <p className="mt-2 text-yellow-700">
          You don't have any saved property groups yet. Please create a group
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Please Select a Group</h2>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {groups.map((group) => (
          <div
            key={group.group_id}
            onClick={() => handleGroupSelect(group.group_id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedGroupId === group.group_id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{group.group_name}</h3>
                <p className="text-sm text-gray-500">
                  Created on: {new Date(group.created_at).toLocaleDateString()}
                </p>
              </div>

              {selectedGroupId === group.group_id && (
                <div className="text-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGetReport}
          disabled={!selectedGroupId}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            selectedGroupId
              ? "bg-gray-800 text-white hover:bg-gray-900"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Generate Report
        </button>
      </div>

      {showInsufficientData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-semibold mb-4">Insufficient Data</h2>
            <p className="text-gray-700 mb-6">
              Your selected group doesn't have enough properties or POIs to
              generate a report. <br />
              <br />
              Please ensure at least <strong>2 properties</strong> and{" "}
              <strong>1 POI</strong>.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowInsufficientData(false)}
                className="px-4 py-2 border rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
