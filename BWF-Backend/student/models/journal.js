const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
  auth_id: {
    type: String,
    required: true,
    index: true
  },

  text: {
    type: String,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Journal", journalSchema);