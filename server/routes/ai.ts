import express from 'express';
import { aiService } from '../services/ai.service';

const router = express.Router();

router.post('/analyze-youtube-plan', async (req, res) => {
  try {
    const { link, studentName } = req.body;
    if (!link) {
      return res.status(400).json({ error: 'Thiếu link youtube' });
    }
    const data = await aiService.analyzeYouTubePlan(link, studentName);
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.post('/analyze-youtube', async (req, res) => {
  try {
    const { youtube_url, student_level } = req.body;
    const data = await aiService.analyzeYoutube(youtube_url, student_level || 'Cơ bản');
    res.json({
      status: 'success',
      data
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

router.post('/analyze-song', async (req, res) => {
  try {
    const { ten_bai_hat, ca_si } = req.body;
    if (!ten_bai_hat) {
      return res.status(400).json({ error: 'Yêu cầu ten_bai_hat' });
    }
    const data = await aiService.analyzeSong(ten_bai_hat, ca_si || 'Không xác định');
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.post('/session-plan', async (req, res) => {
  try {
    const { song_analysis, student_level } = req.body;
    const data = await aiService.generateSessionPlan(song_analysis, student_level || 'Cơ bản');
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.post('/analyze-audio', async (req, res) => {
  try {
    const { note } = req.body;
    const data = await aiService.analyzeAudio(note);
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.post('/next-session', async (req, res) => {
  try {
    const { current_result } = req.body;
    const data = await aiService.suggestNextSession(current_result);
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.post('/evaluate-lesson', async (req, res) => {
  try {
    const payload = req.body;
    const data = await aiService.evaluateLesson(payload);
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

export default router;
