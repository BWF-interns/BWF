"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";

interface Notice {
  id: number;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
}

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: 1,
      title: "New Workshop on Life Skills",
      description:
        "A workshop on time management and productivity will be held in Room 101.",
      date: "2026-03-18",
      isRead: false,
    },
    {
      id: 2,
      title: "Library Maintenance",
      description: "The library will be closed for maintenance on 20th March.",
      date: "2026-03-17",
      isRead: true,
    },
    {
      id: 3,
      title: "Sports Day Event",
      description:
        "Annual Sports Day will be held on 25th March. Participation is encouraged.",
      date: "2026-03-16",
      isRead: false,
    },
  ]);

  const markAsRead = (id: number) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const deleteNotice = (id: number) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Notice Board
        </h1>
        <p className="text-sm text-gray-500">{notices.length} notices</p>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-start ${
              notice.isRead ? "opacity-70" : ""
            }`}
          >
            <div>
              <h3 className="font-semibold text-gray-900">{notice.title}</h3>
              <p className="text-gray-700 text-sm mt-1">{notice.description}</p>
              <span className="text-xs text-gray-400 mt-1 block">
                {notice.date}
              </span>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              {!notice.isRead && (
                <button
                  onClick={() => markAsRead(notice.id)}
                  className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => deleteNotice(notice.id)}
                className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
        {notices.length === 0 && (
          <p className="text-gray-500 text-center mt-4">No notices available</p>
        )}
      </div>
    </div>
  );
}
