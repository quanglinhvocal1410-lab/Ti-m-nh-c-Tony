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

let cachedLessons: Record<string, Lesson[]> = {};
let lastFetchLessonsTime: Record<string, number> = {};
let fetchLessonsPromises: Record<string, Promise<Lesson[]> | null> = {};

export const lessonService = {
  subscribeToLessons(studentId: string, callback: (lessons: Lesson[]) => void, onError?: (error: any) => void) {
    let isSubscribed = true;
    
    if (cachedLessons[studentId] && isSubscribed) {
      callback(cachedLessons[studentId]);
    }
    
    const fetchLessons = async () => {
      // Deduplicate rapid fetches
      if (cachedLessons[studentId] && (Date.now() - (lastFetchLessonsTime[studentId] || 0) < 10000)) {
        return;
      }

      try {
        if (!fetchLessonsPromises[studentId]) {
          fetchLessonsPromises[studentId] = (async () => {
            if (isGAS) {
              return await gasApi.call('getLessonsByStudent', studentId);
            } else {
              const response = await axios.get(`/api/lessons/student/${studentId}`);
              return response.data;
            }
          })();
        }

        const lessons = await fetchLessonsPromises[studentId];
        cachedLessons[studentId] = lessons;
        lastFetchLessonsTime[studentId] = Date.now();
        fetchLessonsPromises[studentId] = null;
        
        if (isSubscribed) callback(lessons);
      } catch (error) {
        fetchLessonsPromises[studentId] = null;
        if (isSubscribed && onError) onError(error);
      }
    };

    fetchLessons();
    const intervalId = setInterval(fetchLessons, 30000); // 30s instead of 5s

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  },

  async getLessonsByStudent(studentId: string): Promise<Lesson[]> {
    if (cachedLessons[studentId]) return cachedLessons[studentId];
    if (isGAS) return gasApi.call('getLessonsByStudent', studentId);
    const response = await axios.get(`/api/lessons/student/${studentId}`);
    return response.data;
  },

  async createLesson(lesson: Omit<Lesson, '_id'>): Promise<Lesson> {
    let result;
    if (isGAS) {
      result = await gasApi.call('createLesson', JSON.stringify(lesson));
    } else {
      const response = await axios.post('/api/lessons', lesson);
      result = response.data;
    }
    delete cachedLessons[lesson.studentId];
    return result;
  },

  async updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
    let result;
    if (isGAS) {
      result = await gasApi.call('updateLesson', id, JSON.stringify(lesson));
    } else {
      const response = await axios.put(`/api/lessons/${id}`, lesson);
      result = response.data;
    }
    cachedLessons = {};
    return result;
  },

  async deleteLesson(id: string): Promise<void> {
    if (isGAS) {
      await gasApi.call('deleteLesson', id);
    } else {
      await axios.delete(`/api/lessons/${id}`);
    }
    cachedLessons = {};
  }
};
