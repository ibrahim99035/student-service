const db = require('./db');

async function migrate() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      departmentId INTEGER REFERENCES departments(id)
    )`,
    `CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      credits INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS department_courses (
      departmentId INTEGER REFERENCES departments(id),
      courseId INTEGER REFERENCES courses(id),
      PRIMARY KEY (departmentId, courseId)
    )`,
    `CREATE TABLE IF NOT EXISTS student_grades (
      studentId INTEGER REFERENCES students(id),
      courseId INTEGER REFERENCES courses(id),
      grade REAL NOT NULL,
      PRIMARY KEY (studentId, courseId)
    )`,
    `INSERT OR IGNORE INTO departments (id, name) VALUES (1, 'Computer Science')`,
    `INSERT OR IGNORE INTO departments (id, name) VALUES (2, 'Mathematics')`,
    `INSERT OR IGNORE INTO students (id, name, age, departmentId) VALUES (1, 'Ibrahim', 25, 1)`,
    `INSERT OR IGNORE INTO students (id, name, age, departmentId) VALUES (2, 'Omar', 24, 1)`,
    `INSERT OR IGNORE INTO students (id, name, age, departmentId) VALUES (3, 'Kariem', 21, 2)`,
    `INSERT OR IGNORE INTO courses (id, name, credits) VALUES (1, 'Algorithms', 3)`,
    `INSERT OR IGNORE INTO courses (id, name, credits) VALUES (2, 'Calculus', 4)`,
    `INSERT OR IGNORE INTO courses (id, name, credits) VALUES (3, 'Data Structures', 3)`,
    `INSERT OR IGNORE INTO department_courses (departmentId, courseId) VALUES (1, 1)`,
    `INSERT OR IGNORE INTO department_courses (departmentId, courseId) VALUES (1, 3)`,
    `INSERT OR IGNORE INTO department_courses (departmentId, courseId) VALUES (2, 2)`,
  ], 'write');

  console.log('Migration done.');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
