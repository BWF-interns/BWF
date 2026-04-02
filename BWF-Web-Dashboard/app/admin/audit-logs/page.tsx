"use client";
// app/admin/audit-logs/page.tsx
// Read-only audit trail of every admin change.

import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";

interface AuditLog {
  _id: string; adminName: string; action: string; targetType: string;
  targetName: string; timestamp: string; note: string;
  before: unknown; after: unknown;
}

const ACTION_COLORS: Record<string, string> = {
  ADD:        "bg-emerald-50 text-emerald-700",
  EDIT:       "bg-blue-50 text-blue-700",
  DEACTIVATE: "bg-amber-50 text-amber-700",
  DELETE:     "bg-red-50 text-red-600",
  APPROVE:    "bg-emerald-50 text-emerald-700",
  REJECT:     "bg-red-50 text-red-600",
};

function actionColor(action: string) {
  const key = Object.keys(ACTION_COLORS).find(k => action.startsWith(k));
  return key ? ACTION_COLORS[key] : "bg-gray-100 text-gray-600";
}

function formatAction(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export default function AuditLogsPage() {
  const [logs, setLogs]         = useState<AuditLog[]>([]);
  const [total, setTotal]       = useState(0);
  const [filterType, setFilterType] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("");
  const [page, setPage]         = useState(1);
  const [expand, setExpand]     = useState<string | null>(null);
  const [error, setError]       = useState("");

  const LIMIT = 25;

  const load = () => {
    const p: Record<string, string> = { limit: String(LIMIT), page: String(page) };
    if (filterType)  p.targetType = filterType;
    if (filterAdmin) p.adminId    = filterAdmin;
    adminAPI.getAuditLogs(p)
      .then(d => { setLogs((d as { logs: AuditLog[]; total: number }).logs); setTotal((d as { total: number }).total); })
      .catch(e => setError(e.message));
  };

  useEffect(() => { load(); }, [filterType, filterAdmin, page]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#2f2a24]">Audit Log</h1>
        <p className="text-sm text-[#8c6d4f]">Complete immutable record of every admin action. Read-only.</p>
      </header>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
          value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {["student","staff","expense","post","kpi"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <input className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f] w-44"
          placeholder="Filter by admin ID..."
          value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value); setPage(1); }} />
        <span className="ml-auto text-sm text-[#8c6d4f] self-center">{total} total entries</span>
      </div>

      {/* Log Table */}
      <div className="overflow-x-auto rounded-xl border border-[#efe3d5] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f8efe5] text-left text-[#6e5034]">
            <tr>{["Timestamp","Admin","Action","Target Type","Target Name","Details"].map(h => (
              <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[#8c6d4f]">No logs found.</td></tr>
            ) : logs.map(l => (
              <>
                <tr key={l._id} className="border-t border-[#f2e9de] hover:bg-[#fdfaf6] cursor-pointer transition"
                  onClick={() => setExpand(expand === l._id ? null : l._id)}>
                  <td className="px-4 py-3 font-mono text-xs text-[#8c6d4f] whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3 font-medium">{l.adminName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColor(l.action)}`}>
                      {formatAction(l.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{l.targetType}</td>
                  <td className="px-4 py-3">{l.targetName || "—"}</td>
                  <td className="px-4 py-3 text-[#8c6d4f] text-xs">{expand === l._id ? "▲ Collapse" : "▶ Expand"}</td>
                </tr>
                {expand === l._id && (
                  <tr key={`${l._id}-expand`} className="bg-[#fdf7f1]">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div>
                          <p className="font-semibold text-[#6e5034] mb-1">Before</p>
                          <pre className="rounded bg-white border border-[#efe3d5] p-2 overflow-auto max-h-40 text-[#4a3f35]">
                            {l.before ? JSON.stringify(l.before, null, 2) : "—"}
                          </pre>
                        </div>
                        <div>
                          <p className="font-semibold text-[#6e5034] mb-1">After</p>
                          <pre className="rounded bg-white border border-[#efe3d5] p-2 overflow-auto max-h-40 text-[#4a3f35]">
                            {l.after ? JSON.stringify(l.after, null, 2) : "—"}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-lg border border-[#dfd1c2] px-3 py-1.5 text-sm hover:bg-[#f5ece1] disabled:opacity-40 transition">
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-[#8c6d4f]">Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}
            className="rounded-lg border border-[#dfd1c2] px-3 py-1.5 text-sm hover:bg-[#f5ece1] disabled:opacity-40 transition">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
