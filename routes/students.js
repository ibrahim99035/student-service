const express = require('express');
const router = express.Router();
const students = require('../data/students');
const departments = require('../data/departments');
const studentGrades = require('../data/studentGrades');

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
router.get('/', (req, res) => {
  res.json(students);
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
router.get('/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
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
router.post('/', (req, res) => {
  const { name, age, departmentId } = req.body;
  if (departmentId && !departments.find(d => d.id === departmentId))
    return res.status(400).json({ message: 'Department not found' });
  const newStudent = {
    id: students.length ? students[students.length - 1].id + 1 : 1,
    name,
    age,
    departmentId: departmentId || null,
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
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
router.put('/:id', (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Student not found' });
  if (req.body.departmentId && !departments.find(d => d.id === req.body.departmentId))
    return res.status(400).json({ message: 'Department not found' });
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
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
router.delete('/:id', (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Student not found' });
  const deleted = students.splice(index, 1);
  res.json(deleted[0]);
});

/**
 * @swagger
 * /students/{id}/grades:
 *   post:
 *     summary: Add a grade for a student in a course
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
 *         description: Grade added
 *       404:
 *         description: Student or course not found
 */
router.post('/:id/grades', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const { courseId, grade } = req.body;
  const courses = require('../data/courses');
  if (!courses.find(c => c.id === courseId))
    return res.status(404).json({ message: 'Course not found' });
  const existing = studentGrades.findIndex(
    g => g.studentId === student.id && g.courseId === courseId
  );
  if (existing !== -1) {
    studentGrades[existing].grade = grade;
    return res.json(studentGrades[existing]);
  }
  const entry = { studentId: student.id, courseId, grade };
  studentGrades.push(entry);
  res.status(201).json(entry);
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
 *         description: List of grades
 *       404:
 *         description: Student not found
 */
router.get('/:id/grades', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const courses = require('../data/courses');
  const grades = studentGrades
    .filter(g => g.studentId === student.id)
    .map(g => ({
      ...g,
      course: courses.find(c => c.id === g.courseId),
    }));
  res.json(grades);
});

module.exports = router;
