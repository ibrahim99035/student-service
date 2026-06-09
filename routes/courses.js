const express = require('express');
const router = express.Router();
const courses = require('../data/courses');
const departmentCourses = require('../data/departmentCourses');
const departments = require('../data/departments');

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
router.get('/', (req, res) => {
  res.json(courses);
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
router.get('/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
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
router.post('/', (req, res) => {
  const { name, credits } = req.body;
  const newCourse = {
    id: courses.length ? courses[courses.length - 1].id + 1 : 1,
    name,
    credits,
  };
  courses.push(newCourse);
  res.status(201).json(newCourse);
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
router.put('/:id', (req, res) => {
  const index = courses.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Course not found' });
  courses[index] = { ...courses[index], ...req.body };
  res.json(courses[index]);
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
router.delete('/:id', (req, res) => {
  const index = courses.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Course not found' });
  const deleted = courses.splice(index, 1);
  // also clean up department assignments
  const dcIndex = departmentCourses.findIndex(dc => dc.courseId === deleted[0].id);
  if (dcIndex !== -1) departmentCourses.splice(dcIndex, 1);
  res.json(deleted[0]);
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
router.get('/:id/departments', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const ids = departmentCourses
    .filter(dc => dc.courseId === course.id)
    .map(dc => dc.departmentId);
  res.json(departments.filter(d => ids.includes(d.id)));
});

module.exports = router;
