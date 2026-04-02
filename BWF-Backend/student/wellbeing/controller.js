const {
  saveMood,
  getMoodHistory,
  saveJournal,
  getJournal
} = require("./service");


async function postMood(req, res) {
  try {
    const auth_id = req.user.auth_id;
    const { mood, note } = req.body;

    if (!mood) {
      return res.status(400).json({ message: "Mood is required" });
    }

    const result = await saveMood(auth_id, mood, note);

    return res.status(200).json({ message: "Mood saved", data: result });

  } catch (err) {
    console.error("MOOD SAVE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
}

async function getMood(req, res) {
  try {
    const auth_id = req.user.auth_id;

    const history = await getMoodHistory(auth_id);

    return res.status(200).json(history);

  } catch (err) {
    console.error("MOOD FETCH ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function postJournal(req, res) {
  try {
    const auth_id = req.user.auth_id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const entry = await saveJournal(auth_id, text);

    return res.status(201).json(entry);

  } catch (err) {
    console.error("JOURNAL SAVE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getJournalEntries(req, res) {
  try {
    const auth_id = req.user.auth_id;

    const entries = await getJournal(auth_id);

    return res.status(200).json(entries);

  } catch (err) {
    console.error("JOURNAL FETCH ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  postMood,
  getMood,
  postJournal,
  getJournalEntries
};