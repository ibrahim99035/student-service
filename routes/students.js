const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required: [name, age]
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         age:
 *           type: integer
 *         departmentId:
 *           type: integer
 *           nullable: true
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of all students
 */
router.get('/', async (req, res) => {
  const result = await db.execute('SELECT * FROM students');
  res.json(result.rows);
});

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student found
 *       404:
 *         description: Student not found
 */
router.get('/:id', async (req, res) => {
  const result = await db.execute({
    sql: 'SELECT * FROM students WHERE id = ?',
    args: [req.params.id],
  });
  if (!result.rows.length) return res.status(404).json({ message: 'Student not found' });
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Add a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, age]
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               departmentId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Student created
 *       400:
 *         description: Department not found
 */
router.post('/', async (req, res) => {
  const { name, age, departmentId } = req.body;
  if (departmentId) {
    const dept = await db.execute({ sql: 'SELECT id FROM departments WHERE id = ?', args: [departmentId] });
    if (!dept.rows.length) return res.status(400).json({ message: 'Department not found' });
  }
  const result = await db.execute({
    sql: 'INSERT INTO students (name, age, departmentId) VALUES (?, ?, ?) RETURNING *',
    args: [name, age, departmentId || null],
  });
  res.status(201).json(result.rows[0]);
});

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
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
 *               age:
 *                 type: integer
 *               departmentId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Student updated
 *       404:
 *         description: Student not found
 */
router.put('/:id', async (req, res) => {
  const existing = await db.execute({ sql: 'SELECT * FROM students WHERE id = ?', args: [req.params.id] });
  if (!existing.rows.length) return res.status(404).json({ message: 'Student not found' });
  const current = existing.rows[0];
  const name = req.body.name ?? current.name;
  const age = req.body.age ?? current.age;
  const departmentId = req.body.departmentId !== undefined ? req.body.departmentId : current.departmentId;
  const result = await db.execute({
    sql: 'UPDATE students SET name = ?, age = ?, departmentId = ? WHERE id = ? RETURNING *',
    args: [name, age, departmentId, req.params.id],
  });
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student deleted
 *       404:
 *         description: Student not found
 */
router.delete('/:id', async (req, res) => {
  const existing = await db.execute({ sql: 'SELECT * FROM students WHERE id = ?', args: [req.params.id] });
  if (!existing.rows.length) return res.status(404).json({ message: 'Student not found' });
  await db.execute({ sql: 'DELETE FROM students WHERE id = ?', args: [req.params.id] });
  res.json(existing.rows[0]);
});

/**
 * @swagger
 * /students/{id}/grades:
 *   post:
 *     summary: Add or update a grade for a student in a course
 *     tags: [Students]
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
 *             required: [courseId, grade]
 *             properties:
 *               courseId:
 *                 type: integer
 *               grade:
 *                 type: number
 *     responses:
 *       201:
 *         description: Grade added or updated
 *       404:
 *         description: Student or course not found
 */
router.post('/:id/grades', async (req, res) => {
  const student = await db.execute({ sql: 'SELECT id FROM students WHERE id = ?', args: [req.params.id] });
  if (!student.rows.length) return res.status(404).json({ message: 'Student not found' });
  const { courseId, grade } = req.body;
  const course = await db.execute({ sql: 'SELECT id FROM courses WHERE id = ?', args: [courseId] });
  if (!course.rows.length) return res.status(404).json({ message: 'Course not found' });
  const result = await db.execute({
    sql: `INSERT INTO student_grades (studentId, courseId, grade) VALUES (?, ?, ?)
          ON CONFLICT(studentId, courseId) DO UPDATE SET grade = excluded.grade
          RETURNING *`,
    args: [req.params.id, courseId, grade],
  });
  res.status(201).json(result.rows[0]);
});

/**
 * @swagger
 * /students/{id}/grades:
 *   get:
 *     summary: Get all grades for a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of grades with course info
 *       404:
 *         description: Student not found
 */
router.get('/:id/grades', async (req, res) => {
  const student = await db.execute({ sql: 'SELECT id FROM students WHERE id = ?', args: [req.params.id] });
  if (!student.rows.length) return res.status(404).json({ message: 'Student not found' });
  const result = await db.execute({
    sql: `SELECT sg.*, c.name as courseName, c.credits
          FROM student_grades sg
          JOIN courses c ON c.id = sg.courseId
          WHERE sg.studentId = ?`,
    args: [req.params.id],
  });
  res.json(result.rows);
});

module.exports = router;
