-- Inicialización de la base de datos CECOALIMENTOS
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Nota: Las tablas serán creadas por Flask-Migrate
-- Este archivo es para configuraciones iniciales adicionales

-- Configurar timezone
SET timezone = 'America/Caracas';

-- Crear índices adicionales para optimización (se ejecutarán después de las migraciones)
-- CREATE INDEX IF NOT EXISTS idx_usuarios_cedula ON usuarios(cedula);
-- CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
-- CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
-- CREATE INDEX IF NOT EXISTS idx_retiros_fecha ON retiros(fecha_retiro_programada);
