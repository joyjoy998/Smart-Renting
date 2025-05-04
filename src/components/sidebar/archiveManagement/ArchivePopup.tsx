"use client";
import React, { useState } from "react";
import { X, Image } from "lucide-react";
import ConfirmPopup from "./ConfirmPopup";
import { useArchiveStore } from "@/stores/useArchiveStore";
import { useGroupIdStore, useGroupStore, Group } from "@/stores/useGroupStore";
import { useAuth } from "@clerk/clerk-react";
import { useSnackbar, closeSnackbar } from "notistack";

export const ArchivePopup = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { userId } = useAuth();
  const { isArchiveOpen, setArchiveOpen } = useArchiveStore();
  const { currentGroupId, setGroupId } = useGroupIdStore();
  const { groups, setGroups } = useGroupStore();
  // console.log(groups.length);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    message: "",
    action: null,
    targetId: null,
  });

  const createNewGroup = async () => {
    if (groups.length >= 3) {
      enqueueSnackbar(
        "You can only create up to 3 archives. Please delete one before creating a new one.",
        {
          variant: "error",
          autoHideDuration: 3000,
          action: (key) => (
            <button onClick={() => closeSnackbar(key)}>x</button>
          ),
        }
      );
      return;
    }
    const groupName = `Archive ${groups.length + 1}`;
    try {
      const response = await fetch("/api/groupId/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_name: groupName,
          user_id: userId,
        }),
      });
      if (!response.ok) {
        enqueueSnackbar("Failed to create new archive. Please try again.", {
          variant: "error",
          autoHideDuration: 3000,
          action: (key) => (
            <button onClick={() => closeSnackbar(key)}>x</button>
          ),
        });
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      const newGroup = responseData.data?.[0];

      if (!newGroup) {
        enqueueSnackbar("Failed to create new archive. Please try again.", {
          variant: "error",
          autoHideDuration: 3000,
          action: (key) => (
            <button onClick={() => closeSnackbar(key)}>x</button>
          ),
        });
        throw new Error("API did not return a valid group.");
      }

      setGroups([...groups, newGroup] as Group[]);
      enqueueSnackbar(
        `New archive "${newGroup.group_name}" created successfully.`,
        {
          variant: "success",
          autoHideDuration: 3000,
          action: (key) => (
            <button onClick={() => closeSnackbar(key)}>x</button>
          ),
        }
      );
    } catch (error) {
      enqueueSnackbar("Failed to create new archive. Please try again.", {
        variant: "error",
        autoHideDuration: 3000,
        action: (key) => <button onClick={() => closeSnackbar(key)}>x</button>,
      });
      console.error("Error creating new group:", error);
    }
  };

  const deleteGroup = async (id: number) => {
    if (groups.length <= 1) {
      enqueueSnackbar(
        "You need at least one archive. Please create a new one before deleting.",
        {
          variant: "warning",
          autoHideDuration: 3000,
          action: (key) => (
            <button onClick={() => closeSnackbar(key)}>x</button>
          ),
        }
      );
      return;
    }
    if (currentGroupId === id) {
      enqueueSnackbar(
        "You cannot delete the currently loaded archive. Please load another archive first.",
        {
          variant: "warning",
          autoHideDuration: 3000,
          action: (key) => (
            <button onClick={() => closeSnackbar(key)}>x</button>
          ),
        }
      );
      return;
    }

    try {
      const response = await fetch("/api/groupId/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: id,
          user_id: userId,
        }),
      });
      if (!response.ok) {
        enqueueSnackbar("Failed to delete archive. Please try again.", {
          variant: "error",
          autoHideDuration: 3000,
          action: (key) => (
            <button onClick={() => closeSnackbar(key)}>x</button>
          ),
        });
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newGroups = groups.filter((group) => group.group_id !== id);
      setGroups(newGroups as Group[]);
      enqueueSnackbar(`Archive deleted successfully.`, {
        variant: "success",
        autoHideDuration: 3000,
        action: (key) => <button onClick={() => closeSnackbar(key)}>x</button>,
      });
    } catch (error) {
      enqueueSnackbar("Failed to delete archive. Please try again.", {
        variant: "error",
        autoHideDuration: 3000,
        action: (key) => <button onClick={() => closeSnackbar(key)}>x</button>,
      });
      console.error("Error deleting group:", error);
    }
  };

  const loadGroup = (id: number) => {
    // console.log(`Loading archive with ID: ${id}`);
    setGroupId(id);
  };

  const startEditing = (group: Group) => {
    setEditingId(group.group_id);
    setEditingName(group.group_name);
  };

  const saveGroupName = async () => {
    if (editingId !== null) {
      try {
        const response = await fetch("/api/groupId/put", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group_id: editingId,
            group_name: editingName,
            user_id: userId,
          }),
        });
        if (!response.ok) {
          enqueueSnackbar("Failed to update group name. Please try again.", {
            variant: "error",
            autoHideDuration: 3000,
            action: (key) => (
              <button onClick={() => closeSnackbar(key)}>x</button>
            ),
          });
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const updatedGroups = groups.map((group) =>
          group.group_id === editingId
            ? { ...group, group_name: editingName }
            : group
        );
        setGroups(updatedGroups as Group[]);
        enqueueSnackbar(`Group name updated successfully.`, {
          variant: "success",
          autoHideDuration: 3000,
          action: (key) => (
            <button onClick={() => closeSnackbar(key)}>x</button>
          ),
        });
      } catch (error) {
        enqueueSnackbar("Failed to update group name. Please try again.", {
          variant: "error",
          autoHideDuration: 3000,
          action: (key) => (
            <button onClick={() => closeSnackbar(key)}>x</button>
          ),
        });
        console.error("Error updating group name:", error);
      }
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveGroupName();
      setEditingId(null);
      setEditingName("");
    }
  };

  const confirmDeleteGroup = (id: number) => {
    const group = groups.find((group) => group.group_id === id);
    setConfirmPopup({
      isOpen: true,
      message: `Are you sure to delete ${group!.group_name}?`,
      action: "delete",
      targetId: id,
    });
  };

  const confirmLoadGroup = (id: number) => {
    const group = groups.find((group) => group.group_id === id);
    setConfirmPopup({
      isOpen: true,
      message: `Are you sure to load ${group!.group_name}?`,
      action: "load",
      targetId: id,
    });
  };

  const handleConfirm = () => {
    const { action, targetId } = confirmPopup;
    if (action === "delete") {
      deleteGroup(targetId);
    } else if (action === "load") {
      loadGroup(targetId);
    }
    closeConfirmPopup();
  };

  const closeConfirmPopup = () => {
    setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
  };

  const formatToSydneyTime = (utcDateString: string): string => {
    const date = new Date(utcDateString);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Australia/Sydney",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat("en-CA", options); // 'en-CA' gives YYYY-MM-DD format
    const parts = formatter.formatToParts(date);

    const extract = (type: string) =>
      parts.find((p) => p.type === type)?.value.padStart(2, "0") ?? "00";

    return `${extract("year")}-${extract("month")}-${extract("day")} ${extract(
      "hour"
    )}:${extract("minute")}`;
  };

  if (!isArchiveOpen) return null;

  return (
    <>
      {/* 背景遮罩层，当打开ArchivePopup时显示 */}
      {isArchiveOpen && (
        <div
          className="fixed inset-0 bg-black/20 transition-opacity z-[1003]"
          onClick={() => setArchiveOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Archive弹出面板 */}
      <div
        className={`
        fixed top-[84px] left-64  
        h-[50vh] w-80
        bg-background border-r 
        rounded-tr-lg rounded-br-lg
        transform transition-transform duration-300 ease-in-out 
        z-[1004]
        overflow-hidden
        ${isArchiveOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* 标题栏 */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Archive</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setArchiveOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 内容区域 - 可滚动 */}
        <div className="flex flex-col h-[calc(100%-64px)] overflow-y-auto">
          {/* 新建按钮 */}
          <div className="p-4 border-b">
            <button
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              onClick={createNewGroup}
            >
              New Archive
            </button>
          </div>

          {/* 档案列表 */}
          <div className="divide-y flex-grow">
            {groups.map((group) => (
              <div
                key={group.group_id}
                className={`flex items-center p-4 ${
                  currentGroupId === group.group_id
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : "dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center flex-1">
                  {/* <div className="w-10 h-10 mr-3 flex items-center justify-center border border-gray-300 rounded">
                    <Image size={20} />
                  </div> */}
                  {/* 考虑以后做缩略图时使用 */}

                  <div className="flex-1">
                    {editingId === group.group_id ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-2 py-1 rounded"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={saveGroupName}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => startEditing(group)}
                      >
                        {group.group_name}
                        {currentGroupId === group.group_id && (
                          <span className="ml-2 text-xs text-blue-600">
                            (Current)
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      {formatToSydneyTime(group.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    className={`px-3 py-1 text-sm ${
                      currentGroupId === group.group_id
                        ? "bg-yellow-500"
                        : "bg-blue-600"
                    } text-white rounded hover:opacity-90 transition`}
                    onClick={() => confirmLoadGroup(group.group_id)}
                  >
                    {currentGroupId === group.group_id ? "Loaded" : "Load"}
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:opacity-90 transition"
                    onClick={() => {
                      confirmDeleteGroup(group.group_id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 使用独立的确认弹窗组件 */}
        <ConfirmPopup
          isOpen={confirmPopup.isOpen}
          message={confirmPopup.message}
          onConfirm={handleConfirm}
          onCancel={closeConfirmPopup}
        />
      </div>
    </>
  );
};
