"use client";
import { useEffect, useState, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const HOMES = ["Jammu", "Anantnag", "Kupwara", "Beerwah"];

const CATEGORIES: Record<string, { label: string; group: string }> = {
  SIR:                    { label: "Social Investigation Report (SIR)",    group: "Child Case Files" },
  ICP:                    { label: "Individual Care Plan (ICP)",            group: "Child Case Files" },
  medical_records:        { label: "Medical Records",                       group: "Child Case Files" },
  education_records:      { label: "Education Records",                     group: "Child Case Files" },
  counseling_notes:       { label: "Counseling / Rehabilitation Notes",     group: "Child Case Files" },
  restoration_report:     { label: "Restoration & Follow-up Report",        group: "Child Case Files" },
  admission_register:     { label: "Admission Register",                    group: "Admission & Discharge" },
  discharge_register:     { label: "Discharge / Restoration Register",      group: "Admission & Discharge" },
  cwc_order_file:         { label: "CWC Order File",                        group: "CWC & Legal" },
  production_register:    { label: "Production Register",                   group: "CWC & Legal" },
  case_followup_file:     { label: "Case Follow-up File",                   group: "CWC & Legal" },
  court_documents:        { label: "Court-related Documents",               group: "CWC & Legal" },
  medical_register:       { label: "Medical Register",                      group: "Health Records" },
  immunization_records:   { label: "Immunization Records",                  group: "Health Records" },
  sick_register:          { label: "Sick Register",                         group: "Health Records" },
  referral_records:       { label: "Hospital Referral Records",             group: "Health Records" },
  diet_register:          { label: "Diet Register",                         group: "Nutrition & Daily Care" },
  stock_register:         { label: "Stock Register (Food & Essentials)",    group: "Nutrition & Daily Care" },
  daily_routine_register: { label: "Daily Routine Register",                group: "Nutrition & Daily Care" },
  education_register:     { label: "Education Register",                    group: "Education & Activities" },
  vocational_training:    { label: "Vocational Training Records",           group: "Education & Activities" },
  attendance_register:    { label: "Attendance Register",                   group: "Education & Activities" },
  activity_file:          { label: "Activity / Skill Development File",     group: "Education & Activities" },
  staff_attendance:       { label: "Staff Attendance Register",             group: "Staff & Administration" },
  staff_personal_files:   { label: "Staff Personal Files",                  group: "Staff & Administration" },
  duty_roster:            { label: "Duty Roster",                           group: "Staff & Administration" },
  leave_records:          { label: "Staff Leave Records",                   group: "Staff & Administration" },
  cash_book:              { label: "Cash Book",                             group: "Financial Records" },
  ledger:                 { label: "Ledger",                                group: "Financial Records" },
  budget_expenditure:     { label: "Budget & Expenditure File",             group: "Financial Records" },
  donation_register:      { label: "Donation Register",                     group: "Financial Records" },
  inspection_register:    { label: "Inspection Register",                   group: "Inspection & Monitoring" },
  visitors_book:          { label: "Visitor's Book",                        group: "Inspection & Monitoring" },
  complaint_register:     { label: "Suggestion / Complaint Register",       group: "Inspection & Monitoring" },
  social_audit_report:    { label: "Social Audit Reports",                  group: "Inspection & Monitoring" },
  ngo_registration:       { label: "NGO Registration & Licenses File",      group: "Miscellaneous" },
  miscellaneous:          { label: "Miscellaneous Files",                   group: "Miscellaneous" },
};

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-100 text-green-800",
  closed:   "bg-gray-100 text-gray-600",
  archived: "bg-yellow-100 text-yellow-800",
  missing:  "bg-red-100 text-red-700",
  flagged:  "bg-orange-100 text-orange-700",
};

type HomeRecord = {
  _id: string;
  home: string;
  category: string;
  title: string;
  fileType: "per_child" | "shared_register";
  childName?: string;
  status: string;
  maintainedBy?: string;
  notes?: string;
  lastInspectedOn?: string;
  entries: { _id: string; date: string; enteredBy: string; content: string; childName?: string; referenceNo?: string }[];
};

type Summary = {
  home: string;
  sharedRegisters: { present: number; required: number };
  perChildFiles: { total: number };
  missingCount: number;
  flaggedCount: number;
  complianceScore: number;
  byCategory: Record<string, { _id: string; title: string; fileType: string; status: string; childName?: string }[]>;
};

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken")}` };
}

export default function HomeRecordsPage() {
  const [selectedHome, setSelectedHome] = useState("Jammu");
  const [activeTab, setActiveTab] = useState<"registers" | "child-files" | "summary">("registers");
  const [records, setRecords] = useState<HomeRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<HomeRecord | null>(null);
  const [newEntry, setNewEntry] = useState("");
  const [newEntryRef, setNewEntryRef] = useState("");
  const [entryLoading, setEntryLoading] = useState(false);
  const [statusEdit, setStatusEdit] = useState<string>("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const ft = activeTab === "registers" ? "shared_register" : "per_child";
      const params = new URLSearchParams({ home: selectedHome, fileType: ft });
      if (filterCat) params.set("category", filterCat);
      const res = await fetch(`${API}/admin/home-records?${params}`, { headers: authHeaders() });
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch { setRecords([]); }
    setLoading(false);
  }, [selectedHome, activeTab, filterCat]);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/home-records/summary/${selectedHome}`, { headers: authHeaders() });
      setSummary(await res.json());
    } catch { setSummary(null); }
    setLoading(false);
  }, [selectedHome]);

  useEffect(() => {
    if (activeTab === "summary") fetchSummary();
    else fetchRecords();
  }, [activeTab, selectedHome, filterCat, fetchRecords, fetchSummary]);

  const addEntry = async () => {
    if (!selectedRecord || !newEntry.trim()) return;
    setEntryLoading(true);
    try {
      await fetch(`${API}/admin/home-records/${selectedRecord._id}/entries`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: newEntry, referenceNo: newEntryRef }),
      });
      setNewEntry(""); setNewEntryRef("");
      await fetchRecords();
      const updated = records.find(r => r._id === selectedRecord._id);
      if (updated) setSelectedRecord(updated);
      showToast("Entry added ✓");
    } catch { showToast("Failed to add entry"); }
    setEntryLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${API}/admin/home-records/${id}`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      fetchRecords();
      if (selectedRecord?._id === id) setSelectedRecord(prev => prev ? { ...prev, status } : prev);
      showToast("Status updated ✓");
    } catch { showToast("Failed to update"); }
  };

  const deleteEntry = async (entryId: string) => {
    if (!selectedRecord) return;
    await fetch(`${API}/admin/home-records/${selectedRecord._id}/entries/${entryId}`, {
      method: "DELETE", headers: authHeaders(),
    });
    fetchRecords();
    showToast("Entry removed");
  };

  const filtered = records.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.childName || "").toLowerCase().includes(search.toLowerCase())
  );

  // Group shared registers by category group
  const grouped: Record<string, HomeRecord[]> = {};
  if (activeTab === "registers") {
    filtered.forEach(r => {
      const g = CATEGORIES[r.category]?.group || "Other";
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(r);
    });
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6" style={{ background: "#fdfaf6", minHeight: "100vh" }}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-[#6e5034] text-white px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">🗂️ Home Records</h1>
          <p className="text-sm text-[#8c6d4f] mt-0.5">
            JJ Act compliance — Ministry of WCD Rule 21 &amp; 22 mandated registers &amp; files
          </p>
        </div>
        {/* Home selector */}
        <div className="flex gap-2 flex-wrap">
          {HOMES.map(h => (
            <button
              key={h}
              onClick={() => { setSelectedHome(h); setSelectedRecord(null); }}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                selectedHome === h ? "bg-[#8c6d4f] text-white shadow" : "bg-white border border-[#dfd1c2] text-[#6e5034] hover:bg-[#f4ede4]"
              }`}
            >{h}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#efe3d5]">
        {(["registers", "child-files", "summary"] as const).map(t => (
          <button key={t} onClick={() => { setActiveTab(t); setSelectedRecord(null); setFilterCat(""); }}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition rounded-t-lg ${
              activeTab === t ? "bg-white border border-b-white border-[#efe3d5] text-[#6e5034] -mb-px" : "text-[#8c6d4f] hover:text-[#6e5034]"
            }`}>
            {t === "registers" ? "📁 Shared Registers" : t === "child-files" ? "👧 Per-Child Files" : "📊 Compliance Summary"}
          </button>
        ))}
      </div>

      {/* ── SUMMARY TAB ── */}
      {activeTab === "summary" && summary && (
        <div className="grid gap-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Shared Registers", value: `${summary.sharedRegisters.present}/${summary.sharedRegisters.required}`, color: "text-green-700" },
              { label: "Per-Child Files", value: summary.perChildFiles.total, color: "text-blue-700" },
              { label: "Missing", value: summary.missingCount, color: "text-red-700" },
              { label: "Compliance Score", value: `${summary.complianceScore}%`, color: summary.complianceScore >= 80 ? "text-green-700" : "text-orange-600" },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl border border-[#efe3d5] bg-white p-4">
                <p className="text-xs text-[#8c6d4f]">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Compliance bar */}
          <div className="rounded-xl border border-[#efe3d5] bg-white p-5">
            <p className="text-sm font-medium text-[#2f2a24] mb-3">Compliance Level — {selectedHome} Home</p>
            <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-4 rounded-full bg-gradient-to-r from-[#8c6d4f] to-[#c4956a] transition-all"
                style={{ width: `${summary.complianceScore}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#8c6d4f]">
              {summary.sharedRegisters.present} of {summary.sharedRegisters.required} required registers maintained
            </p>
          </div>

          {/* Category breakdown */}
          <div className="rounded-xl border border-[#efe3d5] bg-white p-5">
            <p className="text-sm font-semibold text-[#2f2a24] mb-4">Category Breakdown</p>
            <div className="space-y-3">
              {Object.entries(summary.byCategory).map(([cat, items]) => (
                <div key={cat} className="flex items-center justify-between border-b border-[#f4ede4] pb-2">
                  <div>
                    <p className="text-xs font-medium text-[#2f2a24]">{CATEGORIES[cat]?.label || cat}</p>
                    <p className="text-[11px] text-[#8c6d4f]">{CATEGORIES[cat]?.group}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {items.slice(0, 3).map(i => (
                      <span key={i._id} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[i.status] || "bg-gray-100 text-gray-600"}`}>
                        {i.fileType === "per_child" ? i.childName || "child" : i.status}
                      </span>
                    ))}
                    {items.length > 3 && <span className="text-[10px] text-[#8c6d4f]">+{items.length - 3} more</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTERS / CHILD FILES TABS ── */}
      {activeTab !== "summary" && (
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left panel — list */}
          <div className="flex flex-col gap-3 w-full md:w-1/2 lg:w-2/5">
            {/* Search + filter */}
            <div className="flex gap-2">
              <input
                type="text" placeholder="Search..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f] bg-white"
              />
              {activeTab === "registers" && (
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                  className="rounded-lg border border-[#dfd1c2] px-2 py-2 text-xs bg-white text-[#6e5034] outline-none">
                  <option value="">All categories</option>
                  {Object.entries(CATEGORIES).filter(([,v]) => v.group !== "Child Case Files").map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-[#8c6d4f] text-sm">Loading…</div>
            ) : activeTab === "registers" ? (
              // Grouped shared registers
              <div className="overflow-y-auto space-y-4 flex-1">
                {Object.entries(grouped).map(([grp, items]) => (
                  <div key={grp}>
                    <p className="text-[11px] font-semibold uppercase text-[#8c6d4f] mb-1.5 px-1">{grp}</p>
                    <div className="space-y-1">
                      {items.map(r => (
                        <div key={r._id}
                          onClick={() => { setSelectedRecord(r); setStatusEdit(r.status); }}
                          className={`cursor-pointer rounded-lg border px-4 py-3 transition ${
                            selectedRecord?._id === r._id
                              ? "border-[#8c6d4f] bg-[#f8efe5]"
                              : "border-[#efe3d5] bg-white hover:bg-[#fdf6ef]"
                          }`}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[#2f2a24] leading-tight">{CATEGORIES[r.category]?.label || r.title}</p>
                            <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                              {r.status}
                            </span>
                          </div>
                          {r.maintainedBy && <p className="text-[11px] text-[#8c6d4f] mt-0.5">By: {r.maintainedBy}</p>}
                          <p className="text-[11px] text-[#a0917e] mt-0.5">{r.entries.length} entries</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Per-child files flat list
              <div className="overflow-y-auto space-y-1 flex-1">
                {filtered.map(r => (
                  <div key={r._id}
                    onClick={() => { setSelectedRecord(r); setStatusEdit(r.status); }}
                    className={`cursor-pointer rounded-lg border px-4 py-3 transition ${
                      selectedRecord?._id === r._id ? "border-[#8c6d4f] bg-[#f8efe5]" : "border-[#efe3d5] bg-white hover:bg-[#fdf6ef]"
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-[#8c6d4f]">{r.childName}</p>
                        <p className="text-sm font-medium text-[#2f2a24]">{CATEGORIES[r.category]?.label || r.title}</p>
                      </div>
                      <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p className="text-center py-8 text-sm text-[#8c6d4f]">No records found</p>}
              </div>
            )}
          </div>

          {/* Right panel — detail */}
          <div className="flex-1 rounded-xl border border-[#efe3d5] bg-white p-5 overflow-y-auto hidden md:block">
            {!selectedRecord ? (
              <div className="flex h-full items-center justify-center text-[#8c6d4f] text-sm">
                ← Select a record to view details
              </div>
            ) : (
              <div className="space-y-5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#8c6d4f]">{CATEGORIES[selectedRecord.category]?.group}</p>
                    <h2 className="text-lg font-semibold text-[#2f2a24]">{selectedRecord.title}</h2>
                    {selectedRecord.childName && (
                      <p className="text-sm text-[#8c6d4f]">Child: <strong>{selectedRecord.childName}</strong></p>
                    )}
                    <p className="text-xs text-[#a0917e] mt-1">Rule: JJ Model Rules 2016, Rule 21 &amp; 22</p>
                  </div>
                  {/* Status change */}
                  <select value={statusEdit} onChange={e => { setStatusEdit(e.target.value); updateStatus(selectedRecord._id, e.target.value); }}
                    className="rounded-lg border border-[#dfd1c2] px-2 py-1.5 text-xs bg-white text-[#6e5034] outline-none">
                    {["active","closed","archived","missing"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {selectedRecord.notes && (
                  <div className="rounded-lg bg-[#fdf6ef] border border-[#efe3d5] p-3 text-sm text-[#6f6458]">
                    {selectedRecord.notes}
                  </div>
                )}

                {/* Entries log */}
                <div>
                  <p className="text-sm font-semibold text-[#2f2a24] mb-2">Log Entries ({selectedRecord.entries.length})</p>
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {selectedRecord.entries.length === 0 ? (
                      <p className="text-xs text-[#8c6d4f]">No entries yet. Add the first one below.</p>
                    ) : selectedRecord.entries.map(e => (
                      <div key={e._id} className="flex items-start gap-2 rounded-lg border border-[#f4ede4] bg-[#fdfaf6] p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#2f2a24]">{e.content}</p>
                          {e.referenceNo && <p className="text-[11px] text-[#8c6d4f]">Ref: {e.referenceNo}</p>}
                          <p className="text-[10px] text-[#a0917e]">
                            {new Date(e.date).toLocaleDateString("en-IN")} — {e.enteredBy}
                          </p>
                        </div>
                        <button onClick={() => deleteEntry(e._id)}
                          className="text-[10px] text-red-400 hover:text-red-600 shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add entry */}
                <div className="border-t border-[#efe3d5] pt-4 space-y-2">
                  <p className="text-xs font-semibold text-[#2f2a24]">Add New Entry</p>
                  <textarea
                    value={newEntry}
                    onChange={e => setNewEntry(e.target.value)}
                    placeholder="Enter log content…"
                    rows={3}
                    className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f] resize-none"
                  />
                  <input
                    type="text" placeholder="Reference No. (optional)" value={newEntryRef}
                    onChange={e => setNewEntryRef(e.target.value)}
                    className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
                  />
                  <button onClick={addEntry} disabled={entryLoading || !newEntry.trim()}
                    className="w-full rounded-lg bg-[#8c6d4f] py-2 text-sm font-medium text-white hover:bg-[#795a3e] disabled:opacity-50 transition">
                    {entryLoading ? "Saving…" : "Add Entry"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
