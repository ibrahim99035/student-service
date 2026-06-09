const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const studentRoutes = require('./routes/students');
const departmentRoutes = require('./routes/departments');
const courseRoutes = require('./routes/courses');
const assignCourseRoutes = require('./routes/assignCourse');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/students', studentRoutes);
app.use('/departments', departmentRoutes);
app.use('/courses', courseRoutes);
app.use('/assign-course', assignCourseRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
