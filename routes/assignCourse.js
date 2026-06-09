const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * /assign-course:
 *   post:
 *     summary: Assign a course to a department
 *     tags: [AssignCourse]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [departmentId, courseId]
 *             properties:
 *               departmentId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Course assigned
 *       400:
 *         description: Already assigned
 *       404:
 *         description: Department or course not found
 */
router.post('/', async (req, res) => {
  const { departmentId, courseId } = req.body;
  const dept = await db.execute({ sql: 'SELECT id FROM departments WHERE id = ?', args: [departmentId] });
  if (!dept.rows.length) return res.status(404).json({ message: 'Department not found' });
  const course = await db.execute({ sql: 'SELECT id FROM courses WHERE id = ?', args: [courseId] });
  if (!course.rows.length) return res.status(404).json({ message: 'Course not found' });
  const existing = await db.execute({
    sql: 'SELECT * FROM department_courses WHERE departmentId = ? AND courseId = ?',
    args: [departmentId, courseId],
  });
  if (existing.rows.length) return res.status(400).json({ message: 'Course already assigned to this department' });
  await db.execute({
    sql: 'INSERT INTO department_courses (departmentId, courseId) VALUES (?, ?)',
    args: [departmentId, courseId],
  });
  res.status(201).json({ departmentId, courseId });
});

/**
 * @swagger
 * /assign-course:
 *   delete:
 *     summary: Remove a course from a department
 *     tags: [AssignCourse]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [departmentId, courseId]
 *             properties:
 *               departmentId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Assignment removed
 *       404:
 *         description: Assignment not found
 */
router.delete('/', async (req, res) => {
  const { departmentId, courseId } = req.body;
  const existing = await db.execute({
    sql: 'SELECT * FROM department_courses WHERE departmentId = ? AND courseId = ?',
    args: [departmentId, courseId],
  });
  if (!existing.rows.length) return res.status(404).json({ message: 'Assignment not found' });
  await db.execute({
    sql: 'DELETE FROM department_courses WHERE departmentId = ? AND courseId = ?',
    args: [departmentId, courseId],
  });
  res.json({ departmentId, courseId });
});

module.exports = router;
