-- Initial database setup for LIVIC project
-- This file will be executed when the PostgreSQL container starts for the first time
-- The database 'livic_db' is already created by the environment variable POSTGRES_DB

-- Create towers table first (referenced by other tables)
CREATE TABLE IF NOT EXISTS towers (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    numero VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    direccion TEXT NOT NULL,
    pisos INTEGER NOT NULL CHECK (pisos > 0),
    apartamentos_por_piso INTEGER NOT NULL CHECK (apartamentos_por_piso > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create apartments table
CREATE TABLE IF NOT EXISTS apartments (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    numero VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    torre_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (torre_id) REFERENCES towers(id) ON DELETE SET NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    edad INTEGER CHECK (edad > 0),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_types table
CREATE TABLE IF NOT EXISTS activity_types (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icono VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_programada DATE,
    fecha_completada DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA')),
    prioridad VARCHAR(10) NOT NULL DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA')),
    notas TEXT,
    apartamento_id INTEGER,
    torre_id INTEGER,
    tipo_actividad_id INTEGER,
    usuario_asignado_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apartamento_id) REFERENCES apartments(id) ON DELETE SET NULL,
    FOREIGN KEY (torre_id) REFERENCES towers(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_actividad_id) REFERENCES activity_types(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_asignado_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create booking_apartments table
CREATE TABLE IF NOT EXISTS booking_apartments (
    id SERIAL PRIMARY KEY,
    apartamento_id INTEGER NOT NULL,
    torre_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha_check_in DATE NOT NULL,
    fecha_check_out DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (estado IN ('pending', 'confirmed', 'cancelled', 'completed')),
    noches INTEGER NOT NULL CHECK (noches > 0),
    tarifa_por_noche DECIMAL(10,2) DEFAULT 0.00,
    tarifa_limpieza DECIMAL(10,2) DEFAULT 0.00,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apartamento_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (torre_id) REFERENCES towers(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT check_dates CHECK (fecha_check_out > fecha_check_in)
);

-- Insert sample data for towers FIRST (referenced by other tables)
INSERT INTO towers (nombre, numero, descripcion, direccion, pisos, apartamentos_por_piso) VALUES 
('Torre Norte Premium', 'T001', 'Torre principal con vista al norte de la ciudad, acabados de lujo y amplios espacios comunes.', 'Avenida Principal 123, Zona Norte', 25, 4),
('Torre Sur Residencial', 'T002', 'Torre residencial familiar con áreas verdes y zona de juegos infantiles.', 'Calle Secundaria 456, Zona Sur', 15, 6),
('Torre Executive', 'T003', 'Torre ejecutiva con oficinas y apartamentos de alta gama, ubicación estratégica.', 'Boulevard Central 789, Centro Empresarial', 30, 2)
ON CONFLICT (numero) DO NOTHING;

-- Insert sample data for apartments (after towers)
INSERT INTO apartments (nombre, numero, descripcion, torre_id) VALUES 
('Apartamento Premium Vista al Mar', 'A101', 'Hermoso apartamento de 3 habitaciones con vista panorámica al océano, completamente amueblado con acabados de lujo.', 1),
('Estudio Moderno Centro', 'B205', 'Acogedor estudio en el corazón de la ciudad, perfecto para profesionales jóvenes. Incluye cocina americana y balcón.', 1),
('Penthouse Ejecutivo', 'C501', 'Penthouse de lujo con terraza privada, 4 habitaciones, 3 baños y jacuzzi. Ubicación privilegiada.', 2)
ON CONFLICT (numero) DO NOTHING;

-- Insert sample data for users
-- Default password for all users is 'password123' (hashed with bcrypt)
INSERT INTO users (nombre, email, edad, password_hash, role) VALUES 
('Juan Pérez', 'juan@email.com', 30, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('María García', 'maria@email.com', 28, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager'),
('Carlos Rodriguez', 'carlos@email.com', 35, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert sample data for activity_types
INSERT INTO activity_types (nombre, descripcion, color, icono, activo) VALUES 
('Mantenimiento', 'Actividades de mantenimiento general de apartamentos y torres', '#F59E0B', 'wrench', true),
('Limpieza', 'Tareas de limpieza y aseo de espacios comunes y apartamentos', '#10B981', 'broom', true),
('Reparación', 'Reparaciones menores y mayores de equipos e infraestructura', '#EF4444', 'hammer', true),
('Inspección', 'Inspecciones de seguridad y calidad de instalaciones', '#3B82F6', 'search', true)
ON CONFLICT DO NOTHING;

-- Insert sample data for activities
INSERT INTO activities (nombre, descripcion, fecha_programada, estado, prioridad, apartamento_id, torre_id, tipo_actividad_id, usuario_asignado_id, notas) VALUES 
('Revisión de aires acondicionados', 'Revisar y limpiar filtros de aires acondicionados en apartamento A101', '2024-03-25', 'PENDIENTE', 'MEDIA', 1, 1, 1, 1, 'Revisar también la unidad externa'),
('Limpieza profunda post-checkout', 'Limpieza completa del apartamento después del checkout del huésped', '2024-03-21', 'EN_PROGRESO', 'ALTA', 2, 1, 2, 2, 'Incluye limpieza de alfombras'),
('Reparación de grifo cocina', 'Reparar goteo en grifo de la cocina del penthouse', '2024-03-30', 'COMPLETADA', 'MEDIA', 3, 2, 3, 1, 'Repuesto ya disponible en almacén'),
('Inspección de seguridad mensual', 'Inspección mensual de sistemas de seguridad en Torre Norte', '2024-04-01', 'PENDIENTE', 'ALTA', NULL, 1, 4, 3, 'Incluir revisión de cámaras y alarmas'),
('Mantenimiento preventivo ascensores', 'Mantenimiento programado de ascensores Torre Sur', '2024-04-05', 'PENDIENTE', 'ALTA', NULL, 2, 1, 1, 'Coordinar con empresa externa')
ON CONFLICT DO NOTHING;

-- Insert sample data for booking_apartments
INSERT INTO booking_apartments (apartamento_id, torre_id, usuario_id, fecha_check_in, fecha_check_out, estado, noches, tarifa_por_noche, tarifa_limpieza, observaciones) VALUES 
(1, 1, 1, '2024-03-15', '2024-03-20', 'confirmed', 5, 150000.00, 50000.00, 'Reserva familiar para vacaciones de semana santa'),
(2, 1, 2, '2024-03-22', '2024-03-25', 'pending', 3, 120000.00, 40000.00, 'Viaje de negocios'),
(3, 2, 3, '2024-04-01', '2024-04-10', 'confirmed', 9, 300000.00, 80000.00, 'Reserva de penthouse para luna de miel'),
(1, 1, 2, '2024-04-15', '2024-04-18', 'pending', 3, 150000.00, 50000.00, 'Fin de semana largo'),
(2, 1, 1, '2024-05-01', '2024-05-05', 'cancelled', 4, 120000.00, 40000.00, 'Cancelada por cambio de planes');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apartments_numero ON apartments(numero);
CREATE INDEX IF NOT EXISTS idx_apartments_nombre ON apartments(nombre);
CREATE INDEX IF NOT EXISTS idx_apartments_torre_id ON apartments(torre_id);
CREATE INDEX IF NOT EXISTS idx_towers_numero ON towers(numero);
CREATE INDEX IF NOT EXISTS idx_towers_nombre ON towers(nombre);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_nombre ON users(nombre);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_password ON users(email, password_hash);
CREATE INDEX IF NOT EXISTS idx_bookings_apartamento_id ON booking_apartments(apartamento_id);
CREATE INDEX IF NOT EXISTS idx_bookings_torre_id ON booking_apartments(torre_id);
CREATE INDEX IF NOT EXISTS idx_bookings_usuario_id ON booking_apartments(usuario_id);
CREATE INDEX IF NOT EXISTS idx_bookings_fecha_check_in ON booking_apartments(fecha_check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_fecha_check_out ON booking_apartments(fecha_check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_estado ON booking_apartments(estado);
CREATE INDEX IF NOT EXISTS idx_bookings_dates_range ON booking_apartments(fecha_check_in, fecha_check_out);
CREATE INDEX IF NOT EXISTS idx_activity_types_nombre ON activity_types(nombre);
CREATE INDEX IF NOT EXISTS idx_activity_types_activo ON activity_types(activo);
CREATE INDEX IF NOT EXISTS idx_activities_nombre ON activities(nombre);
CREATE INDEX IF NOT EXISTS idx_activities_estado ON activities(estado);
CREATE INDEX IF NOT EXISTS idx_activities_prioridad ON activities(prioridad);
CREATE INDEX IF NOT EXISTS idx_activities_apartamento_id ON activities(apartamento_id);
CREATE INDEX IF NOT EXISTS idx_activities_torre_id ON activities(torre_id);
CREATE INDEX IF NOT EXISTS idx_activities_tipo_actividad_id ON activities(tipo_actividad_id);
CREATE INDEX IF NOT EXISTS idx_activities_usuario_asignado_id ON activities(usuario_asignado_id);
CREATE INDEX IF NOT EXISTS idx_activities_fecha_programada ON activities(fecha_programada);
CREATE INDEX IF NOT EXISTS idx_activities_fecha_completada ON activities(fecha_completada);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO livic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO livic_user;