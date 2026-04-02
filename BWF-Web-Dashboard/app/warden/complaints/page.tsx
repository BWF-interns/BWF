"use client";

import { useState } from "react";
import { CheckCircle, ArrowUpCircle } from "lucide-react";

type Status = "OPEN" | "RESOLVED" | "ESCALATED";

interface Complaint {
  name: string;
  message: string;
  time: string;
  status: Status;
  anonymous?: boolean;
}

export default function ComplaintsPage() {
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");

  const [data, setData] = useState<Complaint[]>([
    {
      name: "Arjun Kumar",
      message: "The study room lights are not working.",
      time: "3/18/2026, 6:32:56 PM",
      status: "OPEN",
    },
    {
      name: "Anonymous",
      message: "I feel unsafe walking back after evening classes.",
      time: "3/18/2026, 6:32:56 PM",
      status: "OPEN",
      anonymous: true,
    },
  ]);

  // 🔍 Filter
  const filtered =
    filter === "ALL" ? data : data.filter((c) => c.status === filter);

  // ✅ Actions
  const updateStatus = (index: number, status: Status) => {
    const updated = [...data];
    updated[index].status = status;
    setData(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Complaints
        </h1>
        <p className="text-sm text-gray-500">
          Manage student complaints
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "OPEN", "RESOLVED", "ESCALATED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-1.5 rounded-lg text-sm border transition ${
              filter === tab
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filtered.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm hover:shadow-md transition"
          >
            {/* LEFT */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-gray-900">
                  {item.name}
                </p>

                {item.anonymous && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    Anonymous
                  </span>
                )}

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.status === "OPEN"
                      ? "bg-blue-100 text-blue-600"
                      : item.status === "RESOLVED"
                      ? "bg-green-100 text-green-600"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-sm text-gray-700">
                {item.message}
              </p>

              <p className="text-xs text-gray-400">
                {item.time}
              </p>
            </div>

            {/* RIGHT ACTIONS */}
            {item.status === "OPEN" && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(i, "RESOLVED")}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  <CheckCircle size={16} />
                  Resolve
                </button>

                <button
                  onClick={() => updateStatus(i, "ESCALATED")}
                  className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"
                >
                  <ArrowUpCircle size={16} />
                  Escalate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}