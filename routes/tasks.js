const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const [r] = await pool.query('INSERT INTO tasks (title) VALUES (?)', [title]);
    res.status(201).json({ id: r.insertId, title });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [r] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    r.affectedRows ? res.sendStatus(204) : res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
router.put('/:id', async (req, res) => {
  const { title, completed } = req.body;

  if (typeof title === 'undefined' || typeof completed === 'undefined') {
    return res.status(400).json({ error: 'Both title and completed are required for PUT' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, completed = ? WHERE id = ?',
      [title, completed, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task fully updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
router.patch('/:id', async (req, res) => {
  const fields = [];
  const values = [];

  if ('title' in req.body) {
    fields.push('title = ?');
    values.push(req.body.title);
  }

  if ('completed' in req.body) {
    fields.push('completed = ?');
    values.push(req.body.completed);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  values.push(req.params.id);

  try {
    const [result] = await pool.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task partially updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
module.exports = router;
