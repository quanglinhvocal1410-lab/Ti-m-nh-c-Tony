import axios from 'axios';
import { gasApi, isGAS } from '../utils/apiBridge';

export interface EvaluationCriterion {
  tieu_chi: string;
  gia_tri: number;
}

export interface Lesson {
  _id: string;
  studentId: string;
  date: string;
  
  // New detailed evaluation fields
  so_buoi?: number;
  thoi_gian_luyen_thanh?: string;
  thoi_gian_hat_bai?: string;
  evaluations?: string; // JSON string of EvaluationCriterion[]
  diem_trung_binh?: number;
  xep_loai?: string;
  diem_manh?: string;
  diem_yeu?: string;
  ghi_chu_ky_thuat?: string;
  bai_tap_luyen_thanh?: string;
  bai_hat_luyen?: string;
  thoi_gian_luyen_hang_ngay?: string;
  trong_tam?: string;
  ky_thuat_can_day?: string;
  muc_tieu?: string;

  // Legacy/other fields
  videoLink?: string;
  teacherNotes?: string;
  youtubeLink?: string;
  score?: number;
  comparison?: string;
  nextLessonPlan?: string;
  courseGoal?: string;
  songNotes?: string;
  audios?: string; // JSON string of Array<{name: string, url: string}>
  createdAt?: string;
  updatedAt?: string;
}

export const lessonService = {
  async getLessonsByStudent(studentId: string): Promise<Lesson[]> {
    if (isGAS) return gasApi.call('getLessonsByStudent', studentId);
    const response = await axios.get(`/api/lessons/student/${studentId}`);
    return response.data;
  },

  async createLesson(lesson: Omit<Lesson, '_id'>): Promise<Lesson> {
    if (isGAS) return gasApi.call('createLesson', JSON.stringify(lesson));
    const response = await axios.post('/api/lessons', lesson);
    return response.data;
  },

  async updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
    if (isGAS) return gasApi.call('updateLesson', id, JSON.stringify(lesson));
    const response = await axios.put(`/api/lessons/${id}`, lesson);
    return response.data;
  },

  async deleteLesson(id: string): Promise<void> {
    if (isGAS) return gasApi.call('deleteLesson', id);
    await axios.delete(`/api/lessons/${id}`);
  }
};
