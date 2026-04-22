import express from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all students
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM students ORDER BY stt ASC');
    const students = stmt.all().map((student: any) => ({
      ...student,
      attendance: student.attendance ? JSON.parse(student.attendance) : [],
      voiceTest: student.voiceTest ? JSON.parse(student.voiceTest) : null,
      online: student.online === 1
    }));
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student by ID
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM students WHERE _id = ?');
    const student = stmt.get(req.params.id) as any;
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({
      ...student,
      attendance: student.attendance ? JSON.parse(student.attendance) : [],
      voiceTest: student.voiceTest ? JSON.parse(student.voiceTest) : null,
      online: student.online === 1
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create student
router.post('/', (req, res) => {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const data = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO students (
        _id, stt, studentCode, status, course, name, attendance, phone, 
        voiceType, rank, lowestNote, highestNote, className, startDate, birthYear, online, 
        avatar, voiceTest, driveLink, createdAt, updatedAt
      ) VALUES (
        @_id, @stt, @studentCode, @status, @course, @name, @attendance, @phone, 
        @voiceType, @rank, @lowestNote, @highestNote, @className, @startDate, @birthYear, @online, 
        @avatar, @voiceTest, @driveLink, @createdAt, @updatedAt
      )
    `);
    
    const newStudent = {
      _id: id,
      stt: data.stt || null,
      studentCode: data.studentCode || null,
      status: data.status || 'Đang học',
      course: data.course || null,
      name: data.name,
      attendance: JSON.stringify(data.attendance || []),
      phone: data.phone || null,
      voiceType: data.voiceType || null,
      rank: data.rank || null,
      lowestNote: data.lowestNote || null,
      highestNote: data.highestNote || null,
      className: data.className || null,
      startDate: data.startDate || null,
      birthYear: data.birthYear || null,
      online: data.online ? 1 : 0,
      avatar: data.avatar || null,
      voiceTest: data.voiceTest ? JSON.stringify(data.voiceTest) : null,
      driveLink: data.driveLink || null,
      createdAt: now,
      updatedAt: now
    };
    
    stmt.run(newStudent);
    
    res.status(201).json({
      ...newStudent,
      attendance: data.attendance || [],
      online: data.online || false
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student
router.put('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const now = new Date().toISOString();
    const data = req.body;
    
    // First check if student exists
    const checkStmt = db.prepare('SELECT * FROM students WHERE _id = ?');
    const existing = checkStmt.get(id) as any;
    
    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const params: any = { id, updatedAt: now };
    
    const updatableFields = [
      'stt', 'studentCode', 'status', 'course', 'name', 'phone', 
      'voiceType', 'rank', 'lowestNote', 'highestNote', 'className', 'startDate', 
      'birthYear', 'avatar', 'driveLink'
    ];
    
    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = @${field}`);
        params[field] = data[field];
      }
    });
    
    if (data.attendance !== undefined) {
      updates.push('attendance = @attendance');
      params.attendance = JSON.stringify(data.attendance);
    }
    
    if (data.voiceTest !== undefined) {
      updates.push('voiceTest = @voiceTest');
      params.voiceTest = data.voiceTest ? JSON.stringify(data.voiceTest) : null;
    }
    
    if (data.online !== undefined) {
      updates.push('online = @online');
      params.online = data.online ? 1 : 0;
    }
    
    updates.push('updatedAt = @updatedAt');
    
    const stmt = db.prepare(`UPDATE students SET ${updates.join(', ')} WHERE _id = @id`);
    stmt.run(params);
    
    // Return updated student
    const updatedStudent = checkStmt.get(id) as any;
    res.json({
      ...updatedStudent,
      attendance: updatedStudent.attendance ? JSON.parse(updatedStudent.attendance) : [],
      voiceTest: updatedStudent.voiceTest ? JSON.parse(updatedStudent.voiceTest) : null,
      online: updatedStudent.online === 1
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete student
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM students WHERE _id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete multiple students
router.post('/delete-multiple', (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid ids array' });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`DELETE FROM students WHERE _id IN (${placeholders})`);
    stmt.run(...ids);
    
    res.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error('Error deleting multiple students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete all students
router.delete('/', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM students');
    stmt.run();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting all students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
