/**
 * SERVIDOR DE API PARA EL SISTEMA DE RESEÑAS
 * =======================================
 *
 * Este archivo implementa un servidor Express para proporcionar
 * endpoints de API que conectan el frontend con la base de datos PostgreSQL.
 *
 * Autor: Trae AI
 * Fecha: 2023
 */

// Importar dependencias
// npm install express cors body-parser mysql2 --save
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db_config_mariadb");

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Habilitar CORS para peticiones desde el frontend
app.use(bodyParser.json()); // Parsear solicitudes JSON
app.use(express.static(".")); // Servir archivos estáticos desde el directorio actual
app.use(express.static("..")); // Servir archivos estáticos desde la carpeta raíz

/**
 * ENDPOINTS DE API
 * ===============
 */

/**
 * GET /api/reviews
 * Obtiene todas las reseñas con opciones de filtrado
 * Query params:
 *   - service: Filtrar por tipo de servicio
 *   - featured: Si es "true", solo devuelve reseñas destacadas
 */
app.get("/api/reviews", async (req, res) => {
  try {
    const { service, featured } = req.query;
    const featuredOnly = featured === "true";

    // Si se proporciona un servicio, buscar su ID en la base de datos
    let serviceId = null;
    if (service) {
      const serviceResult = await db.query(
        "SELECT service_id FROM services WHERE name LIKE ?",
        [`%${service}%`]
      );

      if (serviceResult.rows.length > 0) {
        serviceId = serviceResult.rows[0].service_id;
      }
    }

    // Obtener reseñas filtradas
    const result = await db.getReviews(featuredOnly, serviceId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener reseñas",
    });
  }
});

/**
 * GET /api/reviews/stats
 * Obtiene estadísticas de reseñas, opcionalmente filtradas por servicio
 * Query params:
 *   - service: Filtrar estadísticas por tipo de servicio
 */
app.get("/api/reviews/stats", async (req, res) => {
  try {
    const { service } = req.query;

    let result;
    if (service) {
      // Estadísticas para un servicio específico
      result = await db.query(
        "SELECT * FROM service_review_stats WHERE service_name LIKE ?",
        [`%${service}%`]
      );
      res.json({
        success: true,
        data: result.rows,
      });
    } else {
      // Estadísticas generales
      result = await db.getReviewStats();
      res.json({
        success: true,
        data: result,
      });
    }
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener estadísticas",
    });
  }
});

/**
 * GET /api/services
 * Obtiene la lista de servicios disponibles
 */
app.get("/api/services", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT service_id, name, icon FROM services ORDER BY name"
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener servicios",
    });
  }
});

/**
 * POST /api/reviews
 * Crea una nueva reseña
 * Body:
 *   - name: Nombre del cliente
 *   - email: Email del cliente
 *   - service: Nombre del servicio
 *   - rating: Calificación (1-5)
 *   - comment: Texto de la reseña
 */
app.post("/api/reviews", async (req, res) => {
  try {
    const { name, email, service, rating, comment } = req.body;

    // Validar datos
    if (!name || !email || !service || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: "Todos los campos son obligatorios",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "La calificación debe estar entre 1 y 5",
      });
    }

    // Iniciar una transacción
    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Buscar o crear el cliente
      let customerResult = await connection.execute(
        "SELECT customer_id FROM customers WHERE email = ?",
        [email]
      );

      let customerId;
      if (customerResult[0].length === 0) {
        // Crear nuevo cliente
        const [newCustomer] = await connection.execute(
          "INSERT INTO customers (name, email) VALUES (?, ?)",
          [name, email]
        );
        customerId = newCustomer.insertId;
      } else {
        customerId = customerResult[0][0].customer_id;
      }

      // 2. Buscar el servicio
      const [serviceResult] = await connection.execute(
        "SELECT service_id FROM services WHERE name LIKE ?",
        [`%${service}%`]
      );

      if (serviceResult.length === 0) {
        throw new Error("Servicio no encontrado");
      }

      const serviceId = serviceResult[0].service_id;

      // 3. Crear un proyecto para la reseña
      const [projectResult] = await connection.execute(
        `INSERT INTO projects 
         (customer_id, service_id, title, status, start_date, end_date) 
         VALUES (?, ?, ?, 'completed', DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), CURRENT_DATE)`,
        [customerId, serviceId, `${service} Project`]
      );

      const projectId = projectResult.insertId;

      // 4. Crear la reseña
      const [reviewResult] = await connection.execute(
        `INSERT INTO reviews 
         (project_id, customer_id, service_id, rating, comment, is_featured, is_verified) 
         VALUES (?, ?, ?, ?, ?, FALSE, FALSE)`,
        [projectId, customerId, serviceId, rating, comment]
      );

      await connection.commit();

      // Obtener la fecha de la reseña recién creada
      const [reviewDateResult] = await connection.execute(
        "SELECT review_id, review_date FROM reviews WHERE review_id = ?",
        [reviewResult.insertId]
      );

      res.status(201).json({
        success: true,
        message: "Reseña creada exitosamente",
        data: {
          review_id: reviewResult.insertId,
          review_date: reviewDateResult[0].review_date,
          customer_name: name,
          service_name: service,
          rating: rating,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al crear reseña:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear la reseña: " + error.message,
    });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
  console.log("Endpoints disponibles:");
  console.log("- GET  /api/reviews");
  console.log("- GET  /api/reviews/stats");
  console.log("- GET  /api/services");
  console.log("- POST /api/reviews");
});

/**
 * INSTRUCCIONES DE USO
 * ====================
 *
 * 1. Instalar las dependencias necesarias:
 *    npm install express cors body-parser mysql2
 *
 * 2. Iniciar el servidor:
 *    node server.js
 *
 * 3. Probar los endpoints con herramientas como Postman o desde el frontend
 *
 * 4. Para producción, considerar:
 *    - Usar un proceso manager como PM2
 *    - Configurar un proxy inverso como Nginx
 *    - Implementar HTTPS
 *    - Añadir autenticación para endpoints sensibles
 */
