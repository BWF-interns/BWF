"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";

type Status = "PENDING" | "APPROVED" | "REJECTED";

interface Post {
  author: string;
  content: string;
  time: string;
  status: Status;
}

export default function CommunityPage() {
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  const [posts, setPosts] = useState<Post[]>([
    {
      author: "Arjun Kumar",
      content: "Had a great time at the sports event today!",
      time: "3/18/2026, 6:32 PM",
      status: "PENDING",
    },
    {
      author: "Meera Patel",
      content: "Loved the new books in library!",
      time: "3/18/2026, 5:10 PM",
      status: "APPROVED",
    },
  ]);

  // 🔍 Filter + Search
  const filtered = posts.filter((p) => {
    const matchFilter = filter === "ALL" || p.status === filter;
    const matchSearch = `${p.author} ${p.content}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchFilter && matchSearch;
  });

  // ✅ Update
  const updateStatus = (index: number, status: Status) => {
    const updated = [...posts];
    updated[index].status = status;
    setPosts(updated);

    setToast(`Post ${status.toLowerCase()} successfully`);
    setTimeout(() => setToast(""), 2000);
  };

  // 📊 Stats
  const stats = {
    pending: posts.filter((p) => p.status === "PENDING").length,
    approved: posts.filter((p) => p.status === "APPROVED").length,
    rejected: posts.filter((p) => p.status === "REJECTED").length,
  };

  return (
    <div className="space-y-8 text-gray-900">
      {/* 🔔 Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Community Moderation
        </h1>
        <p className="text-sm text-gray-500">
          Manage and review student posts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <Clock className="text-yellow-500" />
          <div>
            <p className="text-lg font-semibold">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <CheckCircle className="text-green-500" />
          <div>
            <p className="text-lg font-semibold">{stats.approved}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <XCircle className="text-red-500" />
          <div>
            <p className="text-lg font-semibold">{stats.rejected}</p>
            <p className="text-xs text-gray-500">Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-1.5 rounded-lg text-sm border ${
              filter === tab
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            {/* Top */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">
                  {post.author}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {post.time}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  post.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : post.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {post.status}
              </span>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-800 mt-3">
              {post.content}
            </p>

            {/* Actions */}
            {post.status === "PENDING" && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => updateStatus(i, "APPROVED")}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(i, "REJECTED")}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700"
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