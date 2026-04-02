"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type Category = "Food" | "Medical" | "Education" | "Misc";

interface Expense {
  student: string;
  category: Category;
  amount: number;
  description: string;
  date: string;
}

export default function ExpensesPage() {
  const [filter, setFilter] = useState<"ALL" | Category>("ALL");

  const data: Expense[] = [
    {
      student: "Arjun Kumar",
      category: "Food",
      amount: 500,
      description: "Monthly meal",
      date: "3/18/2026",
    },
    {
      student: "Meera Patel",
      category: "Education",
      amount: 1200,
      description: "Books",
      date: "3/18/2026",
    },
  ];

  const filtered =
    filter === "ALL" ? data : data.filter((d) => d.category === filter);

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Expenses
          </h1>
          <p className="text-sm text-gray-500">
            Monthly total: ₹{total.toLocaleString()}
          </p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "Food", "Medical", "Education", "Misc"].map((tab) => (
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

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-left">
              <th className="px-6 py-3 font-medium">Student</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Date</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y">
            {filtered.map((item, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {item.student}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.category === "Food"
                        ? "bg-blue-100 text-blue-600"
                        : item.category === "Education"
                        ? "bg-indigo-100 text-indigo-600"
                        : item.category === "Medical"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.category}
                  </span>
                </td>

                <td className="px-6 py-4 font-semibold text-gray-900">
                  ₹{item.amount}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {item.description}
                </td>

                <td className="px-6 py-4 text-gray-500">
                  {item.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {filtered.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 shadow-sm"
          >
            <div className="flex justify-between">
              <p className="font-medium text-gray-900">
                {item.student}
              </p>
              <span className="text-sm font-semibold text-gray-900">
                ₹{item.amount}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              {item.description}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {item.date}
              </span>

              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}