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

export const studentService = {
  subscribeToStudents(callback: (students: MongoStudent[]) => void, onError?: (error: any) => void) {
    let isSubscribed = true;
    
    const fetchStudents = async () => {
      try {
        let students;
        if (isGAS) {
          students = await gasApi.call('getStudents');
        } else {
          const response = await fetch(API_URL);
          if (!response.ok) throw new Error('Failed to fetch students');
          students = await response.json();
        }
        if (isSubscribed) callback(students);
      } catch (error) {
        if (isSubscribed && onError) onError(error);
      }
    };

    fetchStudents();
    const intervalId = setInterval(fetchStudents, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  },

  subscribeToStudent(id: string, callback: (student: MongoStudent | null) => void, onError?: (error: any) => void) {
    let isSubscribed = true;
    
    const fetchStudent = async () => {
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
        if (isSubscribed) callback(student);
      } catch (error) {
        if (isSubscribed && onError) onError(error);
      }
    };

    fetchStudent();
    const intervalId = setInterval(fetchStudent, 3000);

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
    if (isGAS) return gasApi.call('getStudentById', id);
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch student');
    return response.json();
  },

  async createStudent(student: Partial<MongoStudent>): Promise<MongoStudent> {
    if (isGAS) return gasApi.call('createStudent', JSON.stringify(student));
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    
    if (!response.ok) throw new Error('Failed to create student');
    const newStudent = await response.json();

    // Sync to Google Sheet
    try {
      await fetch('https://script.google.com/macros/s/AKfycbxMHK9VP_OpKbHPmEIYq_Y761dbqu5s0ZlEke9bXHyq-Xhb7RXogrlP-Aqa1IzzB2VV3A/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: "create",
          stt: student.stt || "",
          studentCode: student.studentCode || "",
          status: student.status || "Đang học",
          course: student.course || student.className || "",
          name: student.name || "",
          phone: student.phone || "",
          voiceType: student.voiceType || "",
          rank: student.rank || "",
          range: (student.lowestNote && student.highestNote) ? `${student.lowestNote} - ${student.highestNote}` : (student.lowestNote || student.highestNote || ""),
          className: student.className || "",
          birthYear: student.birthYear || ""
        }),
        redirect: 'follow'
      });
    } catch (sheetError) {
      console.error("Error syncing to Google Sheet:", sheetError);
    }

    return newStudent;
  },

  async updateStudent(
    id: string,
    student: Partial<MongoStudent>,
  ): Promise<MongoStudent> {
    if (isGAS) return gasApi.call('updateStudent', id, JSON.stringify(student));
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update student');
    }
    const updatedStudent = await response.json();

    // Sync to Google Sheet
    try {
      await fetch('https://script.google.com/macros/s/AKfycbxMHK9VP_OpKbHPmEIYq_Y761dbqu5s0ZlEke9bXHyq-Xhb7RXogrlP-Aqa1IzzB2VV3A/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: "update",
          id: id,
          stt: updatedStudent.stt || "",
          studentCode: updatedStudent.studentCode || "",
          status: updatedStudent.status || "Đang học",
          course: updatedStudent.course || updatedStudent.className || "",
          name: updatedStudent.name || "",
          phone: updatedStudent.phone || "",
          voiceType: updatedStudent.voiceType || "",
          rank: updatedStudent.rank || "",
          range: (updatedStudent.lowestNote && updatedStudent.highestNote) ? `${updatedStudent.lowestNote} - ${updatedStudent.highestNote}` : (updatedStudent.lowestNote || updatedStudent.highestNote || ""),
          className: updatedStudent.className || "",
          birthYear: updatedStudent.birthYear || ""
        }),
        redirect: 'follow'
      });
    } catch (sheetError) {
      console.error("Error syncing update to Google Sheet:", sheetError);
    }

    return updatedStudent;
  },

  async deleteStudent(id: string): Promise<void> {
    if (isGAS) return gasApi.call('deleteStudent', id);
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete student');
  },

  async deleteMultipleStudents(ids: string[]): Promise<void> {
    const response = await fetch(`${API_URL}/delete-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!response.ok) throw new Error('Failed to delete multiple students');
  },

  async deleteAllStudents(): Promise<void> {
    const response = await fetch(API_URL, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete all students');
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

