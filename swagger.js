const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student API',
      version: '2.0.0',
      description: 'REST API for managing students, departments, and courses',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
