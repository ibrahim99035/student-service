const BASE = 'http://localhost:3000';

async function run() {

  // ── STUDENTS ──────────────────────────────────────────────
  console.log('\n=== GET all students ===');
  let res = await fetch(`${BASE}/students`);
  console.log(await res.json());

  console.log('\n=== GET student by ID (1) ===');
  res = await fetch(`${BASE}/students/1`);
  console.log(await res.json());

  console.log('\n=== POST new student (no dept) ===');
  res = await fetch(`${BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ali', age: 22 }),
  });
  const newStudent = await res.json();
  console.log(newStudent);

  console.log(`\n=== PUT update student (${newStudent.id}) ===`);
  res = await fetch(`${BASE}/students/${newStudent.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ali Updated', age: 23, departmentId: 1 }),
  });
  console.log(await res.json());

  console.log(`\n=== DELETE student (${newStudent.id}) ===`);
  res = await fetch(`${BASE}/students/${newStudent.id}`, { method: 'DELETE' });
  console.log(await res.json());

  console.log('\n=== GET non-existent student (999) ===');
  res = await fetch(`${BASE}/students/999`);
  console.log(res.status, await res.json());

  // ── DEPARTMENTS ───────────────────────────────────────────
  console.log('\n=== GET all departments ===');
  res = await fetch(`${BASE}/departments`);
  console.log(await res.json());

  console.log('\n=== POST new department ===');
  res = await fetch(`${BASE}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Physics' }),
  });
  const newDept = await res.json();
  console.log(newDept);

  console.log(`\n=== PUT update department (${newDept.id}) ===`);
  res = await fetch(`${BASE}/departments/${newDept.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Physics & Astronomy' }),
  });
  console.log(await res.json());

  console.log('\n=== GET students in department (1) ===');
  res = await fetch(`${BASE}/departments/1/students`);
  console.log(await res.json());

  console.log('\n=== GET courses in department (1) ===');
  res = await fetch(`${BASE}/departments/1/courses`);
  console.log(await res.json());

  console.log(`\n=== DELETE department (${newDept.id}) ===`);
  res = await fetch(`${BASE}/departments/${newDept.id}`, { method: 'DELETE' });
  console.log(await res.json());

  // ── COURSES ───────────────────────────────────────────────
  console.log('\n=== GET all courses ===');
  res = await fetch(`${BASE}/courses`);
  console.log(await res.json());

  console.log('\n=== POST new course ===');
  res = await fetch(`${BASE}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Linear Algebra', credits: 3 }),
  });
  const newCourse = await res.json();
  console.log(newCourse);

  console.log(`\n=== PUT update course (${newCourse.id}) ===`);
  res = await fetch(`${BASE}/courses/${newCourse.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Linear Algebra Advanced', credits: 4 }),
  });
  console.log(await res.json());

  console.log(`\n=== GET departments of course (${newCourse.id}) — should be empty ===`);
  res = await fetch(`${BASE}/courses/${newCourse.id}/departments`);
  console.log(await res.json());

  // ── ASSIGN COURSE TO DEPT ─────────────────────────────────
  console.log(`\n=== POST assign course (${newCourse.id}) to department (2) ===`);
  res = await fetch(`${BASE}/assign-course`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ departmentId: 2, courseId: newCourse.id }),
  });
  console.log(await res.json());

  console.log('\n=== POST assign same course again — should 400 ===');
  res = await fetch(`${BASE}/assign-course`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ departmentId: 2, courseId: newCourse.id }),
  });
  console.log(res.status, await res.json());

  console.log(`\n=== GET departments of course (${newCourse.id}) — should show dept 2 ===`);
  res = await fetch(`${BASE}/courses/${newCourse.id}/departments`);
  console.log(await res.json());

  console.log('\n=== GET courses in department (2) ===');
  res = await fetch(`${BASE}/departments/2/courses`);
  console.log(await res.json());

  console.log(`\n=== DELETE unassign course (${newCourse.id}) from department (2) ===`);
  res = await fetch(`${BASE}/assign-course`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ departmentId: 2, courseId: newCourse.id }),
  });
  console.log(await res.json());

  console.log(`\n=== DELETE course (${newCourse.id}) ===`);
  res = await fetch(`${BASE}/courses/${newCourse.id}`, { method: 'DELETE' });
  console.log(await res.json());

  // ── GRADES ────────────────────────────────────────────────
  console.log('\n=== POST add grade for student (1) in course (1) ===');
  res = await fetch(`${BASE}/students/1/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: 1, grade: 88 }),
  });
  console.log(await res.json());

  console.log('\n=== POST update grade for student (1) in course (1) ===');
  res = await fetch(`${BASE}/students/1/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: 1, grade: 95 }),
  });
  console.log(await res.json());

  console.log('\n=== GET all grades for student (1) ===');
  res = await fetch(`${BASE}/students/1/grades`);
  console.log(await res.json());

  console.log('\n=== POST grade for non-existent student (999) — should 404 ===');
  res = await fetch(`${BASE}/students/999/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: 1, grade: 70 }),
  });
  console.log(res.status, await res.json());
}

run();
