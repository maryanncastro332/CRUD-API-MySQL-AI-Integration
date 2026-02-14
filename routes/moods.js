// routes/moods.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

// POST: add mood
router.post("/", async (req, res) => {
  try {
    const { full_name, mood_text } = req.body;

    // Insert user
    const [userResult] = await db.query(
      "INSERT INTO users (full_name) VALUES (?)",
      [full_name]
    );
    const userId = userResult.insertId;

    // Insert mood entry
    const [moodResult] = await db.query(
      "INSERT INTO mood_entries (user_id, mood_text) VALUES (?, ?)",
      [userId, mood_text]
    );
    const moodId = moodResult.insertId;

    // AI Advice Logic
    const moodLower = mood_text.toLowerCase();
    let aiMessage = "Thank you for sharing!";

    if (moodLower.includes("anxious")) {
      aiMessage = "It is okay to feel anxious. Take deep breaths and focus on one thing at a time.";
    } else if (moodLower.includes("sad")) {
      aiMessage = "It is okay to feel sad. Remember, you are not alone. Talk to someone you trust.";
    } else if (moodLower.includes("scared") || moodLower.includes("afraid")) {
      aiMessage = "Feeling scared is natural. Take deep breaths and remind yourself you are safe.";
    } else if (moodLower.includes("angry")) {
      aiMessage = "It’s okay to feel angry. Try to release the tension in a healthy way, like exercise or journaling.";
    } else if (moodLower.includes("happy") || moodLower.includes("joy")) {
      aiMessage = "Great to hear you’re feeling happy! Keep enjoying the positive moments.";
    }

    // Save AI response
    await db.query(
      "INSERT INTO ai_responses (mood_entry_id, ai_message) VALUES (?, ?)",
      [moodId, aiMessage]
    );

    res.json({ ai_message: aiMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET: fetch all moods + AI responses
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.full_name, m.mood_text, a.ai_message, m.created_at
      FROM users u
      JOIN mood_entries m ON u.id = m.user_id
      JOIN ai_responses a ON m.id = a.mood_entry_id
      ORDER BY m.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
