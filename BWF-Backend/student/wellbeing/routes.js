const express = require("express");
const {authenticateToken} = require("../../auth/middleware")
const router = express.Router();

const {
  postMood,
  getMood,
  postJournal,
  getJournalEntries
} = require("./controller");

router.post("/mood", authenticateToken, postMood);
router.get("/mood", authenticateToken, getMood);

router.post("/journal", authenticateToken, postJournal);
router.get("/journal", authenticateToken, getJournalEntries);
module.exports = router;