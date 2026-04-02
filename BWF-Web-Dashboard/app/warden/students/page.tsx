"use client";

import { useState } from "react";
import { Plus, Search, User } from "lucide-react";
import { WARDEN_DASHBOARD_DATA } from "../../shared/mockData";

export default function StudentsPage() {
  const [query, setQuery] = useState("");

  const students = WARDEN_DASHBOARD_DATA.students;

  const filteredStudents = students.filter((s) =>
    `${s.name} ${s.education}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Students Panel</h1>
          <p className="text-sm text-gray-500">
            Manage and register students
          </p>
        </div>

        {/* Register Button */}
        <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition">
          <Plus size={16} />
          Register Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Grid Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-full text-center">
            No students found
          </p>
        ) : (
          filteredStudents.map((s, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {s.education}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="text-sm text-gray-700">
                Age: {s.age}
              </div>

              {/* Action */}
              <button className="mt-4 text-sm text-blue-600 hover:underline">
                View Details →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}