import Papa from 'papaparse';

export interface MongoStudent {
  _id: string;
  stt?: number;
  studentCode?: string;
  status?: string;
  course?: string;
  name: string;
  attendance?: string[];
  phone?: string;
  voiceType?: string;
  rank?: string;
  lowestNote?: string;
  highestNote?: string;
  className?: string;
  startDate?: string;
  birthYear?: string;
  online?: boolean;
  avatar?: string;
  voiceTest?: any;
  driveLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = '/api/students';
import { gasApi, isGAS } from '../utils/apiBridge';

let cachedStudents: MongoStudent[] | null = null;
let lastFetchStudentsTime = 0;
let fetchStudentsPromise: Promise<MongoStudent[]> | null = null;

export const studentService = {
  subscribeToStudents(callback: (students: MongoStudent[]) => void, onError?: (error: any) => void) {
    let isSubscribed = true;
    
    if (cachedStudents && isSubscribed) {
      callback(cachedStudents);
    }
    
    const fetchStudents = async () => {
      if (cachedStudents && Date.now() - lastFetchStudentsTime < 10000) return;

      try {
        if (!fetchStudentsPromise) {
          fetchStudentsPromise = (async () => {
            if (isGAS) return await gasApi.call('getStudents');
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch students');
            return await response.json();
          })();
        }
        
        const students = await fetchStudentsPromise;
        cachedStudents = students;
        lastFetchStudentsTime = Date.now();
        fetchStudentsPromise = null;

        if (isSubscribed) callback(students);
      } catch (error) {
        fetchStudentsPromise = null;
        if (isSubscribed && onError) onError(error);
      }
    };

    fetchStudents();
    const intervalId = setInterval(fetchStudents, 30000); // 30s interval instead of 3s

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  },

  subscribeToStudent(id: string, callback: (student: MongoStudent | null) => void, onError?: (error: any) => void) {
    let isSubscribed = true;
    
    if (cachedStudents && isSubscribed) {
      const cachedStudent = cachedStudents.find(s => s._id === id);
      if (cachedStudent) callback(cachedStudent);
    }
    
    const fetchStudent = async () => {
      if (cachedStudents && Date.now() - lastFetchStudentsTime < 10000) return;

      try {
        let student;
        if (isGAS) {
          student = await gasApi.call('getStudentById', id);
        } else {
          const response = await fetch(`${API_URL}/${id}`);
          if (response.status === 404) {
            if (isSubscribed) callback(null);
            return;
          }
          if (!response.ok) throw new Error('Failed to fetch student');
          student = await response.json();
        }
        
        // Update local cache
        if (cachedStudents) {
          const index = cachedStudents.findIndex(s => s._id === id);
          if (index !== -1) cachedStudents[index] = student;
        }

        if (isSubscribed) callback(student);
      } catch (error) {
        if (isSubscribed && onError) onError(error);
      }
    };

    fetchStudent();
    const intervalId = setInterval(fetchStudent, 30000); // 30s interval

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  },

  async getAllStudents(): Promise<MongoStudent[]> {
    if (isGAS) return gasApi.call('getStudents');
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  async getStudentById(id: string): Promise<MongoStudent> {
    if (cachedStudents) {
      const cached = cachedStudents.find(s => s._id === id);
      if (cached) return cached;
    }
    if (isGAS) return await gasApi.call('getStudentById', id);
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch student');
    return await response.json();
  },

  async createStudent(student: Partial<MongoStudent>): Promise<MongoStudent> {
    let result;
    if (isGAS) {
      result = await gasApi.call('createStudent', JSON.stringify(student));
    } else {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      
      if (!response.ok) throw new Error('Failed to create student');
      result = await response.json();
    }
    
    cachedStudents = null; // Invalidate cache
    return result;
  },

  async updateStudent(
    id: string,
    student: Partial<MongoStudent>,
  ): Promise<MongoStudent> {
    let updatedStudent;
    if (isGAS) {
      updatedStudent = await gasApi.call('updateStudent', id, JSON.stringify(student));
    } else {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update student');
      }
      updatedStudent = await response.json();
    }
    
    cachedStudents = null; // Invalidate cache
    return updatedStudent;
  },

  async deleteStudent(id: string): Promise<void> {
    if (isGAS) {
      await gasApi.call('deleteStudent', id);
    } else {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete student');
    }
    cachedStudents = null; // Invalidate cache
  },

  async deleteMultipleStudents(ids: string[]): Promise<void> {
    if (isGAS) {
      await gasApi.call('deleteMultipleStudents', JSON.stringify(ids));
    } else {
      const response = await fetch(`${API_URL}/delete-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!response.ok) throw new Error('Failed to delete multiple students');
    }
    cachedStudents = null; // Invalidate cache
  },

  async deleteAllStudents(): Promise<void> {
    if (isGAS) {
      await gasApi.call('deleteAllStudents');
    } else {
      const response = await fetch(API_URL, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete all students');
    }
    cachedStudents = null; // Invalidate cache
  },

  async syncFromGoogleSheet(): Promise<void> {
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/1JiPQORvSP9tHiQcukGlC_cGvgK3BKjtC8vP-XNtlKeM/gviz/tq?tqx=out:csv&sheet=Checkin');
      const csvText = await response.text();
      
      const parsed = Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
      });

      const rows = parsed.data as string[][];
      if (rows.length < 3) return; // Not enough data

      const studentsToSync: Omit<MongoStudent, '_id'>[] = [];

      // Data starts from row 3 (index 2 is dates, index 3 is first student)
      for (let i = 3; i < rows.length; i++) {
        const row = rows[i];
        if (!row[4]) continue; // Skip if no name

        const stt = parseInt(row[0]) || null;
        const studentCode = row[1] || null;
        const status = row[2] || null;
        const course = row[3] || null;
        const name = row[4];
        
        // Attendance starts from index 5
        const attendance: string[] = [];
        for (let j = 5; j < row.length; j++) {
          if (row[j] && row[j].trim() !== '') {
            attendance.push(row[j].trim());
          }
        }

        const studentData: any = {
          name,
          attendance,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (stt !== null) studentData.stt = stt;
        if (studentCode !== null) studentData.studentCode = studentCode;
        if (status !== null) studentData.status = status;
        if (course !== null) studentData.course = course;

        studentsToSync.push(studentData);
      }

      // Delete existing
      await this.deleteAllStudents();

      // Insert new
      for (const student of studentsToSync) {
        await this.createStudent(student);
      }

      console.log(`Synced ${studentsToSync.length} students from Google Sheet.`);
    } catch (error) {
      console.error('Error syncing from Google Sheet:', error);
      throw error;
    }
  },

  async seedMockData(): Promise<void> {
    return this.syncFromGoogleSheet();
  }
};

