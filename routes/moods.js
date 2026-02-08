import express from "express";
import { db } from "../db.js";
import { getAIResponse } from "../services/aiService.js";

const router = express.Router();

// POST - Create Mood (With Extra Credit: Input Validation)
router.post("/", async (req, res) => {
  const { user_id, mood_text } = req.body;

  // EXTRA CREDIT: Reject empty mood
  if (!mood_text || mood_text.trim() === "") {
    return res.status(400).json({ error: "Mood text cannot be empty!" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO mood_entries (user_id, mood_text) VALUES (?, ?)",
      [user_id, mood_text]
    );

    const aiMessage = await getAIResponse(mood_text);

    await db.query(
      "INSERT INTO ai_responses (mood_entry_id, ai_message) VALUES (?, ?)",
      [result.insertId, aiMessage]
    );

    res.json({ message: "Mood saved", aiMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Read Moods
router.get("/", async (req, res) => {
  const [rows] = await db.query(`
    SELECT u.full_name, m.mood_text, a.ai_message
    FROM users u
    JOIN mood_entries m ON u.id = m.user_id
    JOIN ai_responses a ON m.id = a.mood_entry_id
  `);
  res.json(rows);
});

// EXTRA CREDIT: DELETE Mood by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM mood_entries WHERE id = ?", [id]);
    res.json({ message: `Entry ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;