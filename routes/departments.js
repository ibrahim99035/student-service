const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       required: [name]
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 */

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of all departments
 */
router.get('/', async (req, res) => {
  const result = await db.execute('SELECT * FROM departments');
  res.json(result.rows);
});

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department found
 *       404:
 *         description: Department not found
 */
router.get('/:id', async (req, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM departments WHERE id = ?', args: [req.params.id] });
  if (!result.rows.length) return res.status(404).json({ message: 'Department not found' });
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Add a new department
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created
 */
router.post('/', async (req, res) => {
  const { name } = req.body;
  const result = await db.execute({
    sql: 'INSERT INTO departments (name) VALUES (?) RETURNING *',
    args: [name],
  });
  res.status(201).json(result.rows[0]);
});

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update a department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Department updated
 *       404:
 *         description: Department not found
 */
router.put('/:id', async (req, res) => {
  const existing = await db.execute({ sql: 'SELECT * FROM departments WHERE id = ?', args: [req.params.id] });
  if (!existing.rows.length) return res.status(404).json({ message: 'Department not found' });
  const name = req.body.name ?? existing.rows[0].name;
  const result = await db.execute({
    sql: 'UPDATE departments SET name = ? WHERE id = ? RETURNING *',
    args: [name, req.params.id],
  });
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department deleted
 *       404:
 *         description: Department not found
 */
router.delete('/:id', async (req, res) => {
  const existing = await db.execute({ sql: 'SELECT * FROM departments WHERE id = ?', args: [req.params.id] });
  if (!existing.rows.length) return res.status(404).json({ message: 'Department not found' });
  await db.execute({ sql: 'DELETE FROM departments WHERE id = ?', args: [req.params.id] });
  res.json(existing.rows[0]);
});

/**
 * @swagger
 * /departments/{id}/students:
 *   get:
 *     summary: Get all students in a department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of students
 *       404:
 *         description: Department not found
 */
router.get('/:id/students', async (req, res) => {
  const dept = await db.execute({ sql: 'SELECT id FROM departments WHERE id = ?', args: [req.params.id] });
  if (!dept.rows.length) return res.status(404).json({ message: 'Department not found' });
  const result = await db.execute({
    sql: 'SELECT * FROM students WHERE departmentId = ?',
    args: [req.params.id],
  });
  res.json(result.rows);
});

/**
 * @swagger
 * /departments/{id}/courses:
 *   get:
 *     summary: Get all courses assigned to a department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of courses
 *       404:
 *         description: Department not found
 */
router.get('/:id/courses', async (req, res) => {
  const dept = await db.execute({ sql: 'SELECT id FROM departments WHERE id = ?', args: [req.params.id] });
  if (!dept.rows.length) return res.status(404).json({ message: 'Department not found' });
  const result = await db.execute({
    sql: `SELECT c.* FROM courses c
          JOIN department_courses dc ON dc.courseId = c.id
          WHERE dc.departmentId = ?`,
    args: [req.params.id],
  });
  res.json(result.rows);
});

module.exports = router;
