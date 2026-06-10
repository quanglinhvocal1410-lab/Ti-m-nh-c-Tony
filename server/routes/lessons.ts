import express from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all lessons for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const lessons = await db.prepare('SELECT * FROM lessons WHERE studentId = ? ORDER BY date DESC').all(req.params.studentId);
    res.json(lessons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new lesson
router.post('/', async (req, res) => {
  try {
    const lesson = {
      _id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const stmt = db.prepare(`
      INSERT INTO lessons (
        _id, studentId, date, 
        so_buoi, thoi_gian_luyen_thanh, thoi_gian_hat_bai, evaluations, diem_trung_binh, xep_loai,
        diem_manh, diem_yeu, ghi_chu_ky_thuat,
        bai_tap_luyen_thanh, bai_hat_luyen, thoi_gian_luyen_hang_ngay,
        trong_tam, ky_thuat_can_day, muc_tieu,
        videoLink, teacherNotes, youtubeLink, score, comparison, nextLessonPlan, courseGoal, songNotes, audios, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.run(
      lesson._id,
      lesson.studentId,
      lesson.date,
      lesson.so_buoi,
      lesson.thoi_gian_luyen_thanh,
      lesson.thoi_gian_hat_bai,
      lesson.evaluations ? JSON.stringify(lesson.evaluations) : null,
      lesson.diem_trung_binh,
      lesson.xep_loai,
      lesson.diem_manh,
      lesson.diem_yeu,
      lesson.ghi_chu_ky_thuat,
      lesson.bai_tap_luyen_thanh,
      lesson.bai_hat_luyen,
      lesson.thoi_gian_luyen_hang_ngay,
      lesson.trong_tam,
      lesson.ky_thuat_can_day,
      lesson.muc_tieu,
      lesson.videoLink,
      lesson.teacherNotes,
      lesson.youtubeLink,
      lesson.score,
      lesson.comparison,
      lesson.nextLessonPlan,
      lesson.courseGoal,
      lesson.songNotes,
      lesson.audios ? JSON.stringify(lesson.audios) : null,
      lesson.createdAt,
      lesson.updatedAt
    );

    res.status(201).json(lesson);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a lesson
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date().toISOString();

    const keys = Object.keys(updates);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    const stmt = db.prepare(`UPDATE lessons SET ${setClause} WHERE _id = ?`);
    await stmt.run(...values, req.params.id);

    const updatedLesson = await db.prepare('SELECT * FROM lessons WHERE _id = ?').get(req.params.id);
    res.json(updatedLesson);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a lesson
router.delete('/:id', async (req, res) => {
  try {
    await db.prepare('DELETE FROM lessons WHERE _id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
