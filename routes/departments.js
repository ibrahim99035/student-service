const express = require('express');
const router = express.Router();
const departments = require('../data/departments');
const students = require('../data/students');
const courses = require('../data/courses');
const departmentCourses = require('../data/departmentCourses');

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
router.get('/', (req, res) => {
  res.json(departments);
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
router.get('/:id', (req, res) => {
  const dept = departments.find(d => d.id === parseInt(req.params.id));
  if (!dept) return res.status(404).json({ message: 'Department not found' });
  res.json(dept);
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
router.post('/', (req, res) => {
  const { name } = req.body;
  const newDept = {
    id: departments.length ? departments[departments.length - 1].id + 1 : 1,
    name,
  };
  departments.push(newDept);
  res.status(201).json(newDept);
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
router.put('/:id', (req, res) => {
  const index = departments.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Department not found' });
  departments[index] = { ...departments[index], ...req.body };
  res.json(departments[index]);
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
router.delete('/:id', (req, res) => {
  const index = departments.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Department not found' });
  const deleted = departments.splice(index, 1);
  res.json(deleted[0]);
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
router.get('/:id/students', (req, res) => {
  const dept = departments.find(d => d.id === parseInt(req.params.id));
  if (!dept) return res.status(404).json({ message: 'Department not found' });
  res.json(students.filter(s => s.departmentId === dept.id));
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
router.get('/:id/courses', (req, res) => {
  const dept = departments.find(d => d.id === parseInt(req.params.id));
  if (!dept) return res.status(404).json({ message: 'Department not found' });
  const ids = departmentCourses
    .filter(dc => dc.departmentId === dept.id)
    .map(dc => dc.courseId);
  res.json(courses.filter(c => ids.includes(c.id)));
});

module.exports = router;
