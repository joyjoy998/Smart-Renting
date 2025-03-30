"use client";
import React, { useState } from "react";
import { X, Image } from "lucide-react";
import ConfirmPopup from "./ConfirmPopup";
import { useArchiveStore } from "@/stores/useArchiveStore";
import { useGroupIdStore, useGroupStore } from "@/stores/useGroupStore";

export const ArchivePopup = () => {
  const { isArchiveOpen, setArchiveOpen } = useArchiveStore();

  const { currentGroupId, setGroupId } = useGroupIdStore();

  const { groups, setGroups } = useGroupStore();

  // 添加编辑状态
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // 确认弹窗状态
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    message: "",
    action: null,
    targetId: null,
  });

  const createNewGroup = () => {
    const now = new Date();
    const dateString = now
      .toLocaleString("zh-CN", { hour12: false })
      .replace(/\//g, "-");

    // 这里要用 API 对新档案进行创建
  };

  const deleteGroup = (id: number) => {
    // 这里要用 API对档案进行删除
  };

  const loadGroup = (id: number) => {
    // console.log(`Loading archive with ID: ${id}`);
    setGroupId(id);
    // 这里要用 API 进行档案的加载
  };

  // 开始编辑存档名称
  const startEditing = (group) => {
    setEditingId(group.id);
    setEditingName(group.name);
  };

  // 保存编辑后的名称
  const saveGroupName = () => {
    if (editingId !== null) {
      // setArchives(
      //   archives.map((archive) =>
      //     archive.id === editingId ? { ...archive, name: editingName } : archive
      //   )
      // );
      // setEditingId(null);
      // 这里要用 API 对档案名称进行更新
    }
  };

  // 处理按下Enter键保存
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveGroupName();
    }
  };

  // 确认删除存档
  const confirmDeleteGroup = (id: number) => {
    const group = groups.find((group) => group.group_id === id);
    setConfirmPopup({
      isOpen: true,
      message: `Are you sure to delete ${group.group_name}?`,
      action: "delete",
      targetId: id,
    });
  };

  // 确认加载存档
  const confirmLoadGroup = (id: number) => {
    const group = groups.find((group) => group.group_id === id);
    setConfirmPopup({
      isOpen: true,
      message: `Are you sure to load ${group.group_name}?`,
      action: "load",
      targetId: id,
    });
  };

  // 确认弹窗的确认操作
  const handleConfirm = () => {
    const { action, targetId } = confirmPopup;
    if (action === "delete") {
      deleteGroup(targetId);
    } else if (action === "load") {
      loadGroup(targetId);
    }
    closeConfirmPopup();
  };

  // 关闭确认弹窗
  const closeConfirmPopup = () => {
    setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
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
        fixed top-1/4 left-64  
        h-[50vh] w-80
        bg-background border-r 
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
                  currentGroupId === group.group_id ? "bg-blue-50" : ""
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
                      {group.created_at}
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
                    onClick={() => confirmDeleteGroup(group.group_id)}
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
