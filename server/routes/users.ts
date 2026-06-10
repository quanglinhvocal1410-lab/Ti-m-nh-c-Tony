import express from 'express';
import db from '../db';

const router = express.Router();

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE _id = ?');
    const user = await stmt.get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { _id, email, name, role } = req.body;
    const now = new Date().toISOString();
    
    const checkStmt = db.prepare('SELECT * FROM users WHERE _id = ?');
    const existing = await checkStmt.get(_id);
    
    if (existing) {
      // Update
      const stmt = db.prepare('UPDATE users SET name = ?, role = ? WHERE _id = ?');
      await stmt.run(name || (existing as any).name, role || (existing as any).role, _id);
      res.json({ ...existing, name: name || (existing as any).name, role: role || (existing as any).role });
    } else {
      // Insert
      const stmt = db.prepare('INSERT INTO users (_id, email, name, role, createdAt) VALUES (?, ?, ?, ?, ?)');
      await stmt.run(_id, email, name, role || 'student', now);
      res.status(201).json({ _id, email, name, role: role || 'student', createdAt: now });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM users ORDER BY createdAt DESC');
    const users = await stmt.all();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const checkStmt = db.prepare('SELECT * FROM users WHERE _id = ?');
    const existing = await checkStmt.get(id);

    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateStmt = db.prepare('UPDATE users SET role = ? WHERE _id = ?');
    await updateStmt.run(role, id);

    res.json({ message: 'Role updated successfully', role });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
