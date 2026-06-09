const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required: [name, credits]
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         credits:
 *           type: integer
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of all courses
 */
router.get('/', async (req, res) => {
  const result = await db.execute('SELECT * FROM courses');
  res.json(result.rows);
});

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course found
 *       404:
 *         description: Course not found
 */
router.get('/:id', async (req, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM courses WHERE id = ?', args: [req.params.id] });
  if (!result.rows.length) return res.status(404).json({ message: 'Course not found' });
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Add a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, credits]
 *             properties:
 *               name:
 *                 type: string
 *               credits:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Course created
 */
router.post('/', async (req, res) => {
  const { name, credits } = req.body;
  const result = await db.execute({
    sql: 'INSERT INTO courses (name, credits) VALUES (?, ?) RETURNING *',
    args: [name, credits],
  });
  res.status(201).json(result.rows[0]);
});

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
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
 *               credits:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Course updated
 *       404:
 *         description: Course not found
 */
router.put('/:id', async (req, res) => {
  const existing = await db.execute({ sql: 'SELECT * FROM courses WHERE id = ?', args: [req.params.id] });
  if (!existing.rows.length) return res.status(404).json({ message: 'Course not found' });
  const name = req.body.name ?? existing.rows[0].name;
  const credits = req.body.credits ?? existing.rows[0].credits;
  const result = await db.execute({
    sql: 'UPDATE courses SET name = ?, credits = ? WHERE id = ? RETURNING *',
    args: [name, credits, req.params.id],
  });
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course deleted
 *       404:
 *         description: Course not found
 */
router.delete('/:id', async (req, res) => {
  const existing = await db.execute({ sql: 'SELECT * FROM courses WHERE id = ?', args: [req.params.id] });
  if (!existing.rows.length) return res.status(404).json({ message: 'Course not found' });
  await db.execute({ sql: 'DELETE FROM department_courses WHERE courseId = ?', args: [req.params.id] });
  await db.execute({ sql: 'DELETE FROM courses WHERE id = ?', args: [req.params.id] });
  res.json(existing.rows[0]);
});

/**
 * @swagger
 * /courses/{id}/departments:
 *   get:
 *     summary: Get all departments this course is assigned to
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of departments
 *       404:
 *         description: Course not found
 */
router.get('/:id/departments', async (req, res) => {
  const course = await db.execute({ sql: 'SELECT id FROM courses WHERE id = ?', args: [req.params.id] });
  if (!course.rows.length) return res.status(404).json({ message: 'Course not found' });
  const result = await db.execute({
    sql: `SELECT d.* FROM departments d
          JOIN department_courses dc ON dc.departmentId = d.id
          WHERE dc.courseId = ?`,
    args: [req.params.id],
  });
  res.json(result.rows);
});

module.exports = router;
