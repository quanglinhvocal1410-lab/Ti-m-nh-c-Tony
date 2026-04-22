import express from "express";
import db from "../db.js";

const router = express.Router();

// Helper to generate random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Get all students
router.get("/", (req, res) => {
  try {
    const students = db.prepare("SELECT * FROM students ORDER BY stt ASC").all();
    // Parse attendance JSON
    const parsedStudents = students.map((s: any) => ({
      ...s,
      _id: s.id,
      attendance: s.attendance ? JSON.parse(s.attendance) : [],
      online: Boolean(s.online)
    }));
    res.json(parsedStudents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
});

// Get a single student
router.get("/:id", (req, res) => {
  try {
    const student: any = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({
      ...student,
      _id: student.id,
      attendance: student.attendance ? JSON.parse(student.attendance) : [],
      online: Boolean(student.online)
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error });
  }
});

// Create a new student
router.post("/", (req, res) => {
  try {
    const id = generateId();
    const { name, stt, studentCode, status, course, attendance, phone, voiceType, rank, range, className, startDate, birthYear, online, avatar } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO students (id, name, stt, studentCode, status, course, attendance, phone, voiceType, rank, range, className, startDate, birthYear, online, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, name, stt || null, studentCode || null, status || null, course || null,
      attendance ? JSON.stringify(attendance) : '[]',
      phone || null, voiceType || null, rank || null, range || null, className || null,
      startDate || null, birthYear || null, online ? 1 : 0, avatar || null
    );
    
    const newStudent: any = db.prepare("SELECT * FROM students WHERE id = ?").get(id);
    res.status(201).json({
      ...newStudent,
      _id: newStudent.id,
      attendance: newStudent.attendance ? JSON.parse(newStudent.attendance) : [],
      online: Boolean(newStudent.online)
    });
  } catch (error) {
    res.status(400).json({ message: "Error creating student", error });
  }
});

// Update a student
router.put("/:id", (req, res) => {
  try {
    const { name, stt, studentCode, status, course, attendance, phone, voiceType, rank, range, className, startDate, birthYear, online, avatar } = req.body;
    
    const stmt = db.prepare(`
      UPDATE students SET 
        name = COALESCE(?, name),
        stt = COALESCE(?, stt),
        studentCode = COALESCE(?, studentCode),
        status = COALESCE(?, status),
        course = COALESCE(?, course),
        attendance = COALESCE(?, attendance),
        phone = COALESCE(?, phone),
        voiceType = COALESCE(?, voiceType),
        rank = COALESCE(?, rank),
        range = COALESCE(?, range),
        className = COALESCE(?, className),
        startDate = COALESCE(?, startDate),
        birthYear = COALESCE(?, birthYear),
        online = COALESCE(?, online),
        avatar = COALESCE(?, avatar),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(
      name || null, stt || null, studentCode || null, status || null, course || null,
      attendance ? JSON.stringify(attendance) : null,
      phone || null, voiceType || null, rank || null, range || null, className || null,
      startDate || null, birthYear || null, online !== undefined ? (online ? 1 : 0) : null, avatar || null,
      req.params.id
    );
    
    if (result.changes === 0) return res.status(404).json({ message: "Student not found" });
    
    const updatedStudent: any = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
    res.json({
      ...updatedStudent,
      _id: updatedStudent.id,
      attendance: updatedStudent.attendance ? JSON.parse(updatedStudent.attendance) : [],
      online: Boolean(updatedStudent.online)
    });
  } catch (error) {
    res.status(400).json({ message: "Error updating student", error });
  }
});

// Delete a student
router.delete("/:id", (req, res) => {
  try {
    const result = db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error });
  }
});

// Seed data
router.post("/seed/mock", (req, res) => {
  try {
    const MOCK_DATA = [
      { stt: 2, status: 'Hoàn thành', course: 'TN11', name: 'Chị Hiền', attendance: ['X', '24/04/25', 'X', 'x', 'x', 'X', '21/02/26'] },
      { stt: 4, status: 'Hoàn thành', course: 'TNN', name: 'Trung Hiếu', attendance: ['x', 'x', 'x', '22/05/25', '11/06/25', '19/06/25', '01/07/25'] },
      { stt: 6, status: 'Hoàn thành', course: 'TNN', name: 'Hưng', attendance: ['03/07/25', '10/07/25'] },
      { stt: 8, status: 'Hoàn thành', course: 'TNN', name: 'Mạnh', attendance: ['X', 'X', 'X', 'X', 'X', 'X', 'x'] },
      { stt: 1, studentCode: 'A', status: 'Đang học', course: 'TNN', name: 'Nghĩa', attendance: ['18/11/25', '20/11/25', '27/11/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'Nhựt', attendance: ['X', 'x'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'Mạnh Toàn', attendance: ['27/05/25', '10/07/25', '17/07/25', '20/11/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'Mai Toàn', attendance: ['27/05/25', '29/05/25', '03/05/25', '05/06/25', '17/06/25', '19/06/25', '24/06/25', '01/07/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'Thảo', attendance: ['03/05/25', '26/06/25', '10/07/25', '23/07/25', '12/08/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TN11', name: 'Tân', attendance: ['19/06/25', '01/07/25', '10/07/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'Duy', attendance: ['12/08/25', '14/08/25', '17/08/25', '19/08/25', '28/08/25', '14/09/25', '16/09/25', '28/09/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'Nam ', attendance: ['28/09/25', '07/10/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'Huy', attendance: ['15/05/25', '20/05/25', '27/05/25', '03/05/25', '05/06/25', '17/06/25', '24/06/25', '10/07/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'Minh Hiếu', attendance: ['28/09/25', '07/10/25', '28/10/25', '28/10/25', '28/10/25', '28/10/25', '12/11/25', '13/11/25'] },
      { stt: 1, studentCode: 'C', status: 'Nghỉ', course: 'TNN', name: 'C Kim + A Nghĩa', attendance: ['20/07/25', '27/07/25', '10/08/25', '13/08/25', '21/09/25', '05/10/25', '19/10/25', '24/11/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'A. Tuấn', attendance: ['28/08/25', '25/09/25', '28/09/25', '07/10/25', '13/10/25', '21/10/25', '28/10/25', '18/11/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TN11', name: 'Đồng', attendance: ['12/08/25'] },
      { stt: 1, studentCode: 'D', status: 'Đang học', course: 'TN11', name: 'C Thủy', attendance: ['21/09/25', '22/10/25', '05/11/25', '09/11/25', '23/11/25', '01/12/25'] },
      { stt: 1, status: 'Hoàn thành', course: 'TNN', name: 'Lê Phạm Hoàng Quân', attendance: ['07/10/25', '13/10/25', '21/10/25', '23/10/25', '28/10/25', '04/11/25', '13/11/25', '18/11/25'] },
      { stt: 1, studentCode: 'A', status: 'Đang học', course: 'TN11', name: 'Lê Gia Huy', attendance: ['08/10/25', '12/10/25', '14/10/25', '19/10/25', '07/11/25', '16/11/25'] },
      { stt: 1, studentCode: 'C', status: 'Đang học', course: 'TNN', name: 'Phước Thảo', attendance: ['21/10/25', '23/10/25', '28/10/25', '13/11/25'] },
      { stt: 1, studentCode: 'B', status: 'Nghỉ', course: 'TNN', name: 'Phương Trinh', attendance: ['28/10/25', '04/11/25', '13/11/25', 'Mở File'] },
      { stt: 1, studentCode: 'D', status: 'Đang học', course: 'TNN', name: 'Dzung Phạm', attendance: ['23/10/25', '28/10/25', '04/11/25', '12/11/25', '13/11/25', '15/11/25', '27/11/25', '04/12/25', '09/12/25', '12/12/25', '06/01/26', '13/01/26'] },
      { stt: 1, studentCode: 'C', status: 'Đang học', course: 'TN11', name: 'Trung Lê', attendance: ['02/11/25', '09/11/25', '16/11/25', '23/11/25', '07/12/25', '06/01/26'] },
      { stt: 1, studentCode: 'A', status: 'Đang học', course: 'TNN', name: 'My', attendance: ['27/11/25', '02/12/25', '04/12/25', '09/12/25', 'x', '18/12/25', '03/03/26', '05/03/26'] },
      { stt: 1, studentCode: 'B', status: 'Đang học', course: 'TNN', name: 'Khôi', attendance: ['20/11/25', '02/12/25'] },
      { stt: 1, studentCode: 'C', status: 'Đang học', course: 'TNN', name: 'An', attendance: ['02/12/25', '06/01/26', '13/01/26', '20/01/26'] },
      { stt: 1, studentCode: 'D', status: 'Đang học', course: 'TN11', name: 'A Tú + c Yên', attendance: ['26/12/25', '02/01/26', '05/01/26', '07/01/26', '19/01/26', '27/02/26', '02/03/26', '04/03/26', '13/03/26'] },
      { stt: 1, studentCode: 'A', status: 'Đang học', course: 'TN11', name: 'Sơn', attendance: ['21/12/25', '04/01/26'] },
      { stt: 1, studentCode: 'D', status: 'Đang học', course: 'TN11', name: 'Bé Vy', attendance: [] },
      { studentCode: 'D', status: 'Đang học', course: 'TN11', name: 'Sunny', attendance: ['02/03/26', '04/03/26', '09/03/26'] },
      { studentCode: 'B', status: 'Đang học', course: 'TN11', name: 'Kiến Quốc', attendance: ['11/03/26'] },
    ];
    
    db.prepare("DELETE FROM students").run();
    
    const insert = db.prepare(`
      INSERT INTO students (id, stt, studentCode, status, course, name, attendance)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((students) => {
      for (const student of students) {
        insert.run(
          generateId(),
          student.stt || null,
          student.studentCode || null,
          student.status || null,
          student.course || null,
          student.name,
          JSON.stringify(student.attendance || [])
        );
      }
    });
    
    insertMany(MOCK_DATA);
    
    res.json({ message: "Seeded successfully", count: MOCK_DATA.length });
  } catch (error) {
    res.status(500).json({ message: "Error seeding data", error });
  }
});

export default router;
