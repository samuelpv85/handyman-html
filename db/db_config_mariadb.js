/**
 * CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS MARIADB
 * ===============================================
 *
 * Este archivo contiene la configuración necesaria para conectar
 * la aplicación web de Handyman con la base de datos MariaDB.
 *
 * Autor: Trae AI
 * Fecha: 2023
 * Actualizado: 2023 (Migración a MariaDB)
 */

// Importar el módulo mysql2 para MariaDB
// npm install mysql2 --save
const mysql = require("mysql2/promise");

/**
 * CONFIGURACIÓN DE LA CONEXIÓN
 * ============================
 *
 * Estos parámetros deben ser modificados según tu entorno específico:
 * - user: Usuario de MariaDB (por defecto: root)
 * - password: Contraseña del usuario
 * - host: Dirección del servidor de base de datos (localhost para desarrollo local)
 * - port: Puerto de MariaDB (por defecto: 3306)
 * - database: Nombre de la base de datos creada (handyman_db)
 *
 * IMPORTANTE: En un entorno de producción, estas credenciales deben almacenarse
 * en variables de entorno o en un archivo .env (usando dotenv)
 */
const pool = mysql.createPool({
  host: "localhost",
  user: "root", // Cambiar según tu configuración
  password: "tesV2025spv.", // Cambiar por tu contraseña real
  database: "handyman_db",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * FUNCIONES DE UTILIDAD PARA ACCESO A DATOS
 * =========================================
 *
 * Estas funciones facilitan las operaciones comunes de base de datos
 * y proporcionan manejo de errores consistente.
 */

/**
 * Ejecuta una consulta SQL con parámetros opcionales
 * @param {string} text - Consulta SQL a ejecutar
 * @param {Array} params - Parámetros para la consulta (opcional)
 * @returns {Promise} - Promesa con el resultado de la consulta
 */
const query = async (text, params = []) => {
  try {
    const start = Date.now();
    const [rows, fields] = await pool.execute(text, params);
    const duration = Date.now() - start;

    console.log("Consulta ejecutada:", {
      text,
      duration,
      rows: rows.length,
    });

    return { rows, fields };
  } catch (error) {
    console.error("Error al ejecutar consulta:", error.stack);
    throw error;
  }
};

/**
 * Obtiene todas las reseñas con información relacionada
 * @param {boolean} featuredOnly - Si es true, solo devuelve reseñas destacadas
 * @param {number} serviceId - ID del servicio para filtrar (opcional)
 * @returns {Promise} - Promesa con las reseñas
 */
const getReviews = async (featuredOnly = false, serviceId = null) => {
  let sqlQuery = `
    SELECT 
      r.review_id,
      r.rating,
      r.comment,
      r.review_date,
      r.is_verified,
      c.name AS customer_name,
      c.avatar_url,
      c.is_verified AS customer_verified,
      s.name AS service_name,
      s.icon AS service_icon,
      p.title AS project_title
    FROM reviews r
    JOIN customers c ON r.customer_id = c.customer_id
    JOIN services s ON r.service_id = s.service_id
    JOIN projects p ON r.project_id = p.project_id
    WHERE 1=1
  `;

  const params = [];

  if (featuredOnly) {
    sqlQuery += " AND r.is_featured = TRUE";
  }

  if (serviceId) {
    sqlQuery += " AND r.service_id = ?";
    params.push(serviceId);
  }

  sqlQuery += " ORDER BY r.review_date DESC";

  const result = await query(sqlQuery, params);
  return result.rows;
};

/**
 * Obtiene estadísticas de reseñas por servicio
 * @returns {Promise} - Promesa con las estadísticas
 */
const getReviewStats = async () => {
  const sqlQuery = `
    SELECT * FROM service_review_stats
    ORDER BY total_reviews DESC
  `;

  const result = await query(sqlQuery);
  return result.rows;
};

/**
 * Crea una nueva reseña
 * @param {Object} reviewData - Datos de la reseña
 * @returns {Promise} - Promesa con la reseña creada
 */
const createReview = async (reviewData) => {
  const { customerId, serviceId, projectId, rating, comment } = reviewData;

  const sqlQuery = `
    INSERT INTO reviews 
      (customer_id, service_id, project_id, rating, comment, is_verified)
    VALUES 
      (?, ?, ?, ?, ?, FALSE)
  `;

  const result = await query(sqlQuery, [
    customerId,
    serviceId,
    projectId,
    rating,
    comment,
  ]);
  return result;
};

/**
 * INSTRUCCIONES DE USO
 * ====================
 *
 * 1. Instalar las dependencias necesarias:
 *    npm install mysql2
 *
 * 2. Importar este módulo en tus archivos JavaScript:
 *    const db = require('./db/db_config_mariadb');
 *
 * 3. Utilizar las funciones para acceder a los datos:
 *
 *    // Ejemplo: Obtener todas las reseñas
 *    db.getReviews().then(reviews => {
 *      // Procesar las reseñas
 *    }).catch(error => {
 *      console.error('Error al obtener reseñas:', error);
 *    });
 *
 *    // Ejemplo: Obtener reseñas de un servicio específico
 *    db.getReviews(false, 1).then(paintingReviews => {
 *      // Procesar las reseñas de pintura
 *    });
 *
 *    // Ejemplo: Obtener estadísticas de reseñas
 *    db.getReviewStats().then(stats => {
 *      // Mostrar estadísticas
 *    });
 */

// Exportar las funciones para uso en otros archivos
module.exports = {
  query,
  getReviews,
  getReviewStats,
  createReview,
  pool,
};
