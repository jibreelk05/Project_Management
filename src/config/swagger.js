import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description:
        'RESTful API built with Clean Layered Architecture featuring RBAC, resource security guards, and advanced querying.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 8, example: 'password123' },
            role: { type: 'string', enum: ['PROJECT_MANAGER', 'DEVELOPER'], default: 'DEVELOPER' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            token: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            createdBy: { $ref: '#/components/schemas/User' },
            teamMembers: { type: 'array', items: { $ref: '#/components/schemas/User' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProjectInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100, example: 'Sprint 24' },
            description: { type: 'string', example: 'Q4 feature release' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            teamMembers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of User ObjectIds',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            project: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                status: { type: 'string' },
              },
            },
            assignedTo: { $ref: '#/components/schemas/User' },
            dueDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['title', 'project'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200, example: 'Implement login' },
            description: { type: 'string', example: 'Build the login endpoint' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            project: { type: 'string', description: 'Project ObjectId' },
            assignedTo: { type: 'string', description: 'User ObjectId' },
            dueDate: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 45 },
            page: { type: 'integer', example: 1 },
            pages: { type: 'integer', example: 5 },
            limit: { type: 'integer', example: 10 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: { type: 'string' },
          },
        },
      },
    },
    // Global bearerAuth — individual routes can override with `security: []`
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Projects', description: 'Project CRUD' },
      { name: 'Tasks', description: 'Task CRUD' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };