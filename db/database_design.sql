-- ========================================================================
-- DISEÑO DE BASE DE DATOS POSTGRESQL PARA SISTEMA DE RESEÑAS DE HANDYMAN
-- ========================================================================

/*
 * Este archivo contiene el diseño completo de la base de datos para el sistema
 * de reseñas de Handyman, incluyendo tablas, relaciones, índices y datos iniciales.
 * 
 * Autor: Trae AI
 * Fecha: 2023
 */

-- Crear la base de datos si no existe
CREATE DATABASE handyman_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_ES.UTF-8'
    LC_CTYPE = 'es_ES.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

\connect handyman_db

-- Crear extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de servicios
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),  -- Nombre del icono de FontAwesome
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proyectos
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    service_id INTEGER REFERENCES services(service_id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reseñas
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id),
    customer_id INTEGER REFERENCES customers(customer_id),
    service_id INTEGER REFERENCES services(service_id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    review_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para imágenes de reseñas (opcional)
CREATE TABLE review_images (
    image_id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(review_id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);
CREATE INDEX idx_projects_service ON projects(service_id);
CREATE INDEX idx_projects_customer ON projects(customer_id);

-- Función para actualizar el timestamp de actualización
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar automáticamente los timestamps
CREATE TRIGGER update_services_modtime
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_customers_modtime
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_reviews_modtime
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Vista para obtener estadísticas de reseñas por servicio
CREATE VIEW service_review_stats AS
SELECT 
    s.service_id,
    s.name AS service_name,
    COUNT(r.review_id) AS total_reviews,
    ROUND(AVG(r.rating), 1) AS average_rating,
    COUNT(CASE WHEN r.rating = 5 THEN 1 END) AS five_star_count,
    COUNT(CASE WHEN r.rating = 4 THEN 1 END) AS four_star_count,
    COUNT(CASE WHEN r.rating = 3 THEN 1 END) AS three_star_count,
    COUNT(CASE WHEN r.rating = 2 THEN 1 END) AS two_star_count,
    COUNT(CASE WHEN r.rating = 1 THEN 1 END) AS one_star_count
FROM services s
LEFT JOIN reviews r ON s.service_id = r.service_id
GROUP BY s.service_id, s.name;

-- Datos iniciales para servicios
INSERT INTO services (name, description, icon) VALUES
('Painting', 'Interior and exterior painting services', 'fa-paint-roller'),
('Assembly', 'Furniture and equipment assembly', 'fa-tools'),
('Moldings', 'Custom molding installation and design', 'fa-border-style'),
('Carpentry', 'Custom woodworking and carpentry services', 'fa-hammer'),
('Renovation', 'Home and office renovation services', 'fa-home');

-- Datos iniciales para clientes (basados en las reseñas existentes)
INSERT INTO customers (name, email, is_verified) VALUES
('John Doe', 'john.doe@example.com', TRUE),
('Jane Smith', 'jane.smith@example.com', TRUE),
('Carlos Rodríguez', 'carlos.rodriguez@example.com', TRUE),
('Maria González', 'maria.gonzalez@example.com', TRUE),
('Robert Johnson', 'robert.johnson@example.com', TRUE),
('Elena Martínez', 'elena.martinez@example.com', TRUE);

-- Datos iniciales para proyectos
INSERT INTO projects (customer_id, service_id, title, status, start_date, end_date) VALUES
(1, 1, 'Interior Painting', 'completed', '2023-03-01', '2023-03-15'),
(2, 2, 'Furniture Assembly', 'completed', '2023-04-15', '2023-04-22'),
(3, 3, 'Decorative Moldings', 'completed', '2023-05-01', '2023-05-10'),
(4, 4, 'Cabinet Renovation', 'completed', '2023-06-10', '2023-06-18'),
(5, 2, 'Custom Shelving', 'completed', '2023-06-25', '2023-07-05'),
(6, 5, 'Bathroom Remodeling', 'completed', '2023-08-01', '2023-08-12');

-- Datos iniciales para reseñas (basados en las reseñas existentes)
INSERT INTO reviews (project_id, customer_id, service_id, rating, comment, is_featured, is_verified, review_date) VALUES
(1, 1, 1, 5, 'Excellent service! The painting job they did in my living room exceeded my expectations. The team was professional, punctual and left everything impeccably clean.', TRUE, TRUE, '2023-03-15'),
(2, 2, 2, 4.5, 'I hired Handyman for furniture assembly in my new apartment. They were efficient, detail-oriented and very helpful with suggestions. Highly recommended!', TRUE, TRUE, '2023-04-22'),
(3, 3, 3, 5, 'The molding installation completely transformed my dining room. The craftsmanship is outstanding and the attention to detail is impressive. Will definitely use their services again.', TRUE, TRUE, '2023-05-10'),
(4, 4, 4, 5, 'I needed to renovate my kitchen cabinets and Handyman did an amazing job. They were very professional from start to finish and completed the work ahead of schedule. The quality of their carpentry work is exceptional.', TRUE, TRUE, '2023-06-18'),
(5, 5, 2, 4, 'Handyman installed custom shelving throughout my office space. The team was knowledgeable and efficient. The shelves look great and have significantly improved our storage capacity. Would recommend for any office renovation.', FALSE, TRUE, '2023-07-05'),
(6, 6, 5, 4.5, 'We hired Handyman to remodel our bathroom and they did a fantastic job. The tile work is beautiful and the fixtures were installed perfectly. They were very attentive to our needs and made sure everything was exactly as we wanted.', TRUE, TRUE, '2023-08-12');

/*
 * INSTRUCCIONES DE CONEXIÓN A LA BASE DE DATOS
 * =============================================
 * 
 * 1. Instalar las dependencias necesarias:
 *    - npm install pg
 * 
 * 2. Crear un archivo de configuración (db_config.js) con los parámetros de conexión
 * 
 * 3. Utilizar el pool de conexiones para realizar consultas a la base de datos
 * 
 * 4. Implementar manejo de errores adecuado para todas las operaciones de base de datos
 */

-- Ejemplo de consulta para obtener todas las reseñas con información del cliente y servicio
/*
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
WHERE r.is_featured = TRUE
ORDER BY r.review_date DESC;
*/