const express = require('express');
const router = express.Router();
const departmentCourses = require('../data/departmentCourses');
const departments = require('../data/departments');
const courses = require('../data/courses');

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
 *         description: Course assigned to department
 *       400:
 *         description: Already assigned or invalid IDs
 *       404:
 *         description: Department or course not found
 */
router.post('/', (req, res) => {
  const { departmentId, courseId } = req.body;
  if (!departments.find(d => d.id === departmentId))
    return res.status(404).json({ message: 'Department not found' });
  if (!courses.find(c => c.id === courseId))
    return res.status(404).json({ message: 'Course not found' });
  if (departmentCourses.find(dc => dc.departmentId === departmentId && dc.courseId === courseId))
    return res.status(400).json({ message: 'Course already assigned to this department' });
  const entry = { departmentId, courseId };
  departmentCourses.push(entry);
  res.status(201).json(entry);
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
 *         description: Course removed from department
 *       404:
 *         description: Assignment not found
 */
router.delete('/', (req, res) => {
  const { departmentId, courseId } = req.body;
  const index = departmentCourses.findIndex(
    dc => dc.departmentId === departmentId && dc.courseId === courseId
  );
  if (index === -1) return res.status(404).json({ message: 'Assignment not found' });
  const deleted = departmentCourses.splice(index, 1);
  res.json(deleted[0]);
});

module.exports = router;
