const MoodLog = require("../models/moodLog");
const Journal = require("../models/journal");

const moodMap = {
  "Happy": "happy",
  "Okay": "okay",
  "Need Help": "need_help"
};

const reverseMoodMap = {
  "happy": "Happy",
  "okay": "Okay",
  "need_help": "Need Help"
};

async function saveMood(auth_id, mood, note) {
  const mappedMood = moodMap[mood];

  if (!mappedMood) {
    throw new Error("Invalid mood");
  }

  const today = new Date().toISOString().split("T")[0];

  const updated = await MoodLog.findOneAndUpdate(
    { auth_id, date: today },
    {
      mood: mappedMood,
      note,
      last_modified: new Date()
    },
    { upsert: true, new: true }
  );

  return updated;
}

async function getMoodHistory(auth_id) {
  const logs = await MoodLog.find({ auth_id })
    .sort({ date: -1 })
    .limit(30)
    .lean();

  return logs.map(log => ({
    id: log._id,
    date: log.date,
    mood: reverseMoodMap[log.mood],
    note: log.note || ""
  }));
}

async function saveJournal(auth_id, text) {
  const entry = await Journal.create({
    auth_id,
    text
  });

  return entry;
}

async function getJournal(auth_id) {
  const entries = await Journal.find({ auth_id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return entries;
}

module.exports = {
  saveMood,
  getMoodHistory,
  saveJournal,
  getJournal
};