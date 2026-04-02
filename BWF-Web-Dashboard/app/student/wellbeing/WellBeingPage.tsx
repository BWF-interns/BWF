"use client";
// app/student/wellbeing/WellBeingPage.tsx
import { useState } from "react";
import "../styles/wellbeing.css";
import { MessageCircleHeart, BookHeart, Wind, Sparkles, ChevronRight, Heart } from "lucide-react";

/* ───────────────────────────────
   TYPES
─────────────────────────────── */
type Mood = "Happy" | "Okay" | "Need Help";

interface MoodEntry {
  id: number;
  date: string;
  mood: Mood;
  note: string;
}

/* ───────────────────────────────
   STATIC DATA
─────────────────────────────── */
const MOOD_CONFIG: Record<Mood, { emoji: string; label: string; color: string; bg: string; border: string; affirmation: string }> = {
  "Happy":     { emoji: "😊", label: "Happy",     color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0", affirmation: "That's wonderful! Your joy matters. 🌸"              },
  "Okay":      { emoji: "😐", label: "Okay",      color: "#d97706", bg: "#fef3c7", border: "#fde68a", affirmation: "It's okay to just be okay. You're doing fine. 💛"    },
  "Need Help": { emoji: "😨", label: "Need Help", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5", affirmation: "You are never alone. Reaching out is brave. 💜"       },
};

const JOURNALING_PROMPTS = [
  "What is one thing that made you smile today?",
  "Name three things you are grateful for right now.",
  "What is something kind you did for someone today?",
  "What is one thing you are proud of this week?",
  "If you could send a message to your future self, what would you say?",
  "What is one challenge you faced today and how did you handle it?",
];

const QUICK_RESOURCES = [
  {
    icon: MessageCircleHeart,
    label: "Chat with a Mentor",
    sub: "Ms. Dana Elomo is here for you",
    color: "#db2777",
    bg: "#fce7f3",
    border: "#fbcfe8",
  },
  {
    icon: Wind,
    label: "Guided Breathing",
    sub: "2-minute calming exercise",
    color: "#2563eb",
    bg: "#dbeafe",
    border: "#bfdbfe",
  },
  {
    icon: BookHeart,
    label: "Journaling Prompts",
    sub: "Write what's on your mind",
    color: "#7c3aed",
    bg: "#ede9fe",
    border: "#ddd6fe",
  },
];

const INITIAL_HISTORY: MoodEntry[] = [
  { id: 1, date: "2026-03-18", mood: "Happy",     note: "Finished my Science project!" },
  { id: 2, date: "2026-03-17", mood: "Okay",      note: "Busy day, but manageable." },
  { id: 3, date: "2026-03-16", mood: "Need Help", note: "Felt stressed with assignments." },
];

/* ───────────────────────────────
   COMPONENT
─────────────────────────────── */
export default function WellBeingPage() {
  const [selectedMood, setSelectedMood]     = useState<Mood | null>(null);
  const [note, setNote]                     = useState("");
  const [moodHistory, setMoodHistory]       = useState<MoodEntry[]>(INITIAL_HISTORY);
  const [journalText, setJournalText]       = useState("");
  const [journalSaved, setJournalSaved]     = useState(false);
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [showBreathing, setShowBreathing]   = useState(false);
  const [breathPhase, setBreathPhase]       = useState<"in" | "hold" | "out">("in");
  const [breathCount, setBreathCount]       = useState(0);

  /* Mood submit */
  const handleMoodSubmit = () => {
    if (!selectedMood) return;
    const entry: MoodEntry = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      mood: selectedMood,
      note,
    };
    setMoodHistory(prev => [entry, ...prev]);
    setNote("");
    setSelectedMood(null);
  };

  /* Journal save */
  const handleJournalSave = () => {
    if (!journalText.trim()) return;
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2500);
    setJournalText("");
  };

  /* Random prompt */
  const nextPrompt = () => {
    setActivePromptIdx(i => (i + 1) % JOURNALING_PROMPTS.length);
  };

  /* Format date */
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  /* Breathing — simple 3-phase CSS animation driven by state */
  const startBreathing = () => {
    setShowBreathing(true);
    setBreathPhase("in");
    setBreathCount(0);
    const phases: Array<{ phase: "in" | "hold" | "out"; ms: number }> = [
      { phase: "in",   ms: 4000 },
      { phase: "hold", ms: 2000 },
      { phase: "out",  ms: 4000 },
    ];
    let i = 0;
    const run = () => {
      const p = phases[i % phases.length];
      setBreathPhase(p.phase);
      if (i % phases.length === 0 && i > 0) setBreathCount(c => c + 1);
      i++;
      if (i < phases.length * 4) setTimeout(run, p.ms);
      else { setTimeout(() => setShowBreathing(false), 1000); }
    };
    run();
  };

  const PHASE_TEXT = { in: "Breathe in…", hold: "Hold…", out: "Breathe out…" };

  return (
    <div className="wb-page">

      {/* HEADER */}
      <header className="wb-header">
        <div>
          <p className="wb-eyebrow">Wellbeing / Help</p>
          <h1 className="wb-title">Your Safe Space</h1>
        </div>
        <p className="wb-subtitle">We're here to listen. You matter. 🌸</p>
      </header>

      {/* HERO BANNER */}
      <section className="wb-hero">
        <div className="wb-hero-blob wb-hero-blob-1" />
        <div className="wb-hero-blob wb-hero-blob-2" />
        <div className="wb-hero-content">
          <div className="wb-hero-text">
            <h2>Your Safe Space.</h2>
            <p>Borderless World Foundation is here for you — always.</p>
          </div>
          <div className="wb-hero-illustration">
            <div className="wb-lotus">🪷</div>
          </div>
        </div>

        {/* Quick resource cards inside hero */}
        <div className="wb-quick-resources">
          {QUICK_RESOURCES.map((r, i) => (
            <button
              key={i}
              className="wb-resource-card"
              style={{ "--rc": r.color, "--rb": r.bg, "--rbd": r.border } as React.CSSProperties}
              onClick={() => r.label === "Guided Breathing" ? startBreathing() : undefined}
            >
              <div className="wb-rc-icon">
                <r.icon size={20} />
              </div>
              <div className="wb-rc-text">
                <span className="wb-rc-label">{r.label}</span>
                <span className="wb-rc-sub">{r.sub}</span>
              </div>
              <ChevronRight size={16} className="wb-rc-chevron" />
            </button>
          ))}
        </div>
      </section>

      {/* BREATHING MODAL */}
      {showBreathing && (
        <div className="wb-breathing-overlay" onClick={() => setShowBreathing(false)}>
          <div className="wb-breathing-modal" onClick={e => e.stopPropagation()}>
            <div className={`wb-breath-circle wb-breath-circle--${breathPhase}`}>
              <span className="wb-breath-emoji">🌬️</span>
            </div>
            <p className="wb-breath-phase">{PHASE_TEXT[breathPhase]}</p>
            <p className="wb-breath-count">Cycle {Math.min(breathCount + 1, 4)} of 4</p>
            <button className="wb-breath-close" onClick={() => setShowBreathing(false)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="wb-grid">

        {/* LEFT: Mood Tracker */}
        <div className="wb-col">

          {/* Mood Check-In */}
          <section className="wb-card wb-mood-card">
            <div className="wb-card-header">
              <span className="wb-card-emoji">💭</span>
              <h2 className="wb-card-title">How are you feeling today?</h2>
            </div>

            <div className="wb-mood-buttons">
              {(Object.keys(MOOD_CONFIG) as Mood[]).map(m => {
                const cfg = MOOD_CONFIG[m];
                const isSelected = selectedMood === m;
                return (
                  <button
                    key={m}
                    className={`wb-mood-btn ${isSelected ? "wb-mood-btn--active" : ""}`}
                    style={{ "--mc": cfg.color, "--mb": cfg.bg, "--mbd": cfg.border } as React.CSSProperties}
                    onClick={() => setSelectedMood(m)}
                  >
                    <span className="wb-mood-emoji">{cfg.emoji}</span>
                    <span className="wb-mood-label">{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Affirmation */}
            {selectedMood && (
              <div className="wb-affirmation">
                <Sparkles size={14} />
                {MOOD_CONFIG[selectedMood].affirmation}
              </div>
            )}

            {/* Optional note */}
            {selectedMood && (
              <>
                <textarea
                  className="wb-note-input"
                  placeholder="Want to add a note? (optional)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                />
                <button className="wb-submit-btn" onClick={handleMoodSubmit}>
                  <Heart size={15} fill="currentColor" />
                  Save my mood
                </button>
              </>
            )}
          </section>

          {/* Mood History */}
          <section className="wb-card">
            <div className="wb-card-header">
              <span className="wb-card-emoji">📅</span>
              <h2 className="wb-card-title">Mood History</h2>
            </div>
            <div className="wb-history-list">
              {moodHistory.slice(0, 6).map(entry => {
                const cfg = MOOD_CONFIG[entry.mood];
                return (
                  <div key={entry.id} className="wb-history-item"
                    style={{ "--mc": cfg.color, "--mb": cfg.bg } as React.CSSProperties}>
                    <span className="wb-hist-emoji">{cfg.emoji}</span>
                    <div className="wb-hist-text">
                      <span className="wb-hist-mood" style={{ color: cfg.color }}>{entry.mood}</span>
                      {entry.note && <p className="wb-hist-note">{entry.note}</p>}
                    </div>
                    <span className="wb-hist-date">{formatDate(entry.date)}</span>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* RIGHT: Daily Reflection / Journal */}
        <div className="wb-col">

          <section className="wb-card wb-journal-card">
            <div className="wb-card-header">
              <span className="wb-card-emoji">📓</span>
              <h2 className="wb-card-title">Daily Reflection</h2>
            </div>

            {/* Rotating prompt */}
            <div className="wb-prompt-box">
              <p className="wb-prompt-text">"{JOURNALING_PROMPTS[activePromptIdx]}"</p>
              <button className="wb-prompt-next" onClick={nextPrompt}>
                New prompt ✨
              </button>
            </div>

            <textarea
              className="wb-journal-input"
              placeholder="How are you feeling right now? Write a few thoughts…"
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              rows={5}
            />

            <button
              className={`wb-save-btn ${journalSaved ? "wb-save-btn--saved" : ""}`}
              onClick={handleJournalSave}
              disabled={!journalText.trim()}
            >
              {journalSaved ? "✅ Saved to your journal!" : "Save to Journal"}
            </button>
          </section>

          {/* Positive affirmations / grounding card */}
          <section className="wb-card wb-ground-card">
            <div className="wb-card-header">
              <span className="wb-card-emoji">🌿</span>
              <h2 className="wb-card-title">Grounding Reminder</h2>
            </div>
            <div className="wb-ground-steps">
              {[
                { n: "5", text: "things you can see",   emoji: "👀" },
                { n: "4", text: "things you can touch", emoji: "✋" },
                { n: "3", text: "things you can hear",  emoji: "👂" },
                { n: "2", text: "things you can smell", emoji: "👃" },
                { n: "1", text: "thing you can taste",  emoji: "👅" },
              ].map((s, i) => (
                <div key={i} className="wb-ground-step">
                  <span className="wb-ground-num">{s.n}</span>
                  <span className="wb-ground-emoji">{s.emoji}</span>
                  <span className="wb-ground-text">{s.text}</span>
                </div>
              ))}
            </div>
            <p className="wb-ground-footer">This helps bring you back to the present moment. 🌸</p>
          </section>

        </div>
      </div>

    </div>
  );
}
