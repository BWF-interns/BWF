"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

type Status = "PENDING" | "APPROVED" | "REJECTED";

interface Activity {
  student: string;
  activity: string;
  hours: string;
  status: Status;
  date: string;
}

export default function ActivitiesPage() {
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");

  const [data, setData] = useState<Activity[]>([
    {
      student: "Arjun Kumar",
      activity: "Study Group",
      hours: "1h",
      status: "APPROVED",
      date: "3/18/2026",
    },
    {
      student: "Arjun Kumar",
      activity: "Sports",
      hours: "2h",
      status: "PENDING",
      date: "3/18/2026",
    },
    {
      student: "Meera Patel",
      activity: "Art Workshop",
      hours: "3h",
      status: "PENDING",
      date: "3/18/2026",
    },
  ]);

  // 🔥 Filter logic
  const filtered =
    filter === "ALL" ? data : data.filter((d) => d.status === filter);

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
        <h1 className="text-xl sm:text-2xl font-bold text-black">
          Activities
        </h1>
        <p className="text-sm text-black">
          Review and approve student activities
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-1.5 rounded-lg text-sm border ${
              filter === tab
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-black border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-black">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Activity</th>
              <th className="p-4">Hours</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="p-4">{item.student}</td>
                <td className="p-4">{item.activity}</td>
                <td className="p-4">{item.hours}</td>

                {/* Status Badge */}
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "APPROVED"
                        ? "bg-green-100 text-green-600"
                        : item.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="p-4">{item.date}</td>

                {/* Actions */}
                <td className="p-4">
                  {item.status === "PENDING" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(i, "APPROVED")}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-xs"
                      >
                        <Check size={14} /> Approve
                      </button>

                      <button
                        onClick={() => updateStatus(i, "REJECTED")}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-xs"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filtered.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4 space-y-2"
          >
            <div className="flex justify-between">
              <p className="font-medium text-black">{item.student}</p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  item.status === "APPROVED"
                    ? "bg-green-100 text-green-600"
                    : item.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {item.status}
              </span>
            </div>

            <p className="text-sm text-black">
              {item.activity} • {item.hours}
            </p>

            <p className="text-xs text-gray-500">{item.date}</p>

            {item.status === "PENDING" && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => updateStatus(i, "APPROVED")}
                  className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(i, "REJECTED")}
                  className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-xs"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}