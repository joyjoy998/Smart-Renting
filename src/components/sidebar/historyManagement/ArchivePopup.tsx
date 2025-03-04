"use client";
import React, { useState } from "react";
import { X, Image } from "lucide-react";
import ConfirmPopup from "./ConfirmPopup";
import { useArchiveStore } from "@/stores/useArchiveStore";

export const ArchivePopup = () => {
  const { isArchiveOpen, setArchiveOpen } = useArchiveStore();
  const [archives, setArchives] = useState([
    { id: 1, name: "Archive 1", date: "2024-12-08 16:31:01" },
    // sample data
  ]);
  // 这里要写一个 useEffect 来加载档案列表

  // 添加当前选中的存档ID状态
  const [currentArchiveId, setCurrentArchiveId] = useState(null);

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

  const createNewArchive = () => {
    const now = new Date();
    const dateString = now.toISOString().replace("T", " ").substring(0, 19);
    const newArchive = {
      id: archives.length > 0 ? Math.max(...archives.map((a) => a.id)) + 1 : 1,
      name: `Archive ${archives.length + 1}`,
      date: dateString,
    };
    setArchives([...archives, newArchive]);
    // 这里要用 API 对新档案进行创建
  };

  const deleteArchive = (id) => {
    setArchives(archives.filter((archive) => archive.id !== id));
    if (currentArchiveId === id) {
      setCurrentArchiveId(null);
    }
    // 这里要用 API对档案进行删除
  };

  const loadArchive = (id) => {
    console.log(`Loading archive with ID: ${id}`);
    setCurrentArchiveId(id);
    // 这里要用 API 进行档案的加载
  };

  // 开始编辑存档名称
  const startEditing = (archive) => {
    setEditingId(archive.id);
    setEditingName(archive.name);
  };

  // 保存编辑后的名称
  const saveArchiveName = () => {
    if (editingId !== null) {
      setArchives(
        archives.map((archive) =>
          archive.id === editingId ? { ...archive, name: editingName } : archive
        )
      );
      setEditingId(null);
      // 这里要用 API 对档案名称进行更新
    }
  };

  // 处理按下Enter键保存
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveArchiveName();
    }
  };

  // 确认删除存档
  const confirmDeleteArchive = (id) => {
    const archive = archives.find((a) => a.id === id);
    setConfirmPopup({
      isOpen: true,
      message: `Are you sure to delete ${archive.name}?`,
      action: "delete",
      targetId: id,
    });
  };

  // 确认加载存档
  const confirmLoadArchive = (id) => {
    const archive = archives.find((a) => a.id === id);
    setConfirmPopup({
      isOpen: true,
      message: `Are you sure to load ${archive.name}?`,
      action: "load",
      targetId: id,
    });
  };

  // 确认弹窗的确认操作
  const handleConfirm = () => {
    const { action, targetId } = confirmPopup;
    if (action === "delete") {
      deleteArchive(targetId);
    } else if (action === "load") {
      loadArchive(targetId);
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
      {/* {isArchiveOpen && (
        <div
          className="fixed inset-0 bg-black/30 transition-opacity z-[1003]"
          onClick={() => setArchiveOpen(false)}
          aria-hidden="true"
        />
      )} */}

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
              onClick={createNewArchive}
            >
              New Archive
            </button>
          </div>

          {/* 档案列表 */}
          <div className="divide-y flex-grow">
            {archives.map((archive) => (
              <div
                key={archive.id}
                className={`flex items-center p-4 ${
                  currentArchiveId === archive.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 mr-3 flex items-center justify-center border border-gray-300 rounded">
                    <Image size={20} />
                  </div>
                  <div className="flex-1">
                    {editingId === archive.id ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-2 py-1 rounded"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={saveArchiveName}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => startEditing(archive)}
                      >
                        {archive.name}
                        {currentArchiveId === archive.id && (
                          <span className="ml-2 text-xs text-blue-600">
                            (Current)
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">{archive.date}</div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    className={`px-3 py-1 text-sm ${
                      currentArchiveId === archive.id
                        ? "bg-blue-500"
                        : "bg-blue-600"
                    } text-white rounded hover:opacity-90 transition`}
                    onClick={() => confirmLoadArchive(archive.id)}
                  >
                    {currentArchiveId === archive.id ? "Loaded" : "Load"}
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:opacity-90 transition"
                    onClick={() => confirmDeleteArchive(archive.id)}
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
