import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Baches Rosario API",
      version: "1.0.0",
      description: "API REST para el sistema de reporte de baches en Rosario",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Bache: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            titulo: {
              type: "string",
              example: "Bache en calle principal",
            },
            descripcion: {
              type: "string",
              example: "Bache grande en la intersección",
            },
            ubicacion: {
              type: "object",
              properties: {
                lat: {
                  type: "number",
                  example: -32.9442,
                },
                lng: {
                  type: "number",
                  example: -60.6505,
                },
                direccion: {
                  type: "string",
                  example: "Av. Pellegrini 1234",
                },
              },
            },
            imagenes: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["/uploads/bache-1234567890.jpg"],
            },
            fechaReporte: {
              type: "string",
              format: "date-time",
            },
            fechaSolucion: {
              type: "string",
              format: "date-time",
            },
            estado: {
              type: "string",
              enum: ["reportado", "en_proceso", "solucionado"],
              example: "reportado",
            },
            tiempoSolucion: {
              type: "number",
              example: 5,
            },
            reportadoPor: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                },
                nombre: {
                  type: "string",
                },
                email: {
                  type: "string",
                },
              },
            },
            votos: {
              type: "array",
              items: {
                type: "object",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439012",
            },
            contenido: {
              type: "string",
              example: "Este bache está muy mal, necesita reparación urgente",
            },
            fecha: {
              type: "string",
              format: "date-time",
            },
            autor: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                },
                nombre: {
                  type: "string",
                },
                email: {
                  type: "string",
                },
              },
            },
            bache: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/server.js"], // Rutas donde buscar documentación
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
