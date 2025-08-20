import { Pool, QueryResult } from 'pg';

// For local development using node-postgres
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'livic_user',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'livic_db',
  password: process.env.POSTGRES_PASSWORD || 'livic_password',
  port: 5432,
});

// Create a sql template literal function similar to @vercel/postgres
const sqlFunction = async (strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult> => {
  let query = '';
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      query += `$${i + 1}`;
    }
  }
  
  return pool.query(query, values);
};

// Add query method for raw SQL with parameters
sqlFunction.query = async (text: string, params: any[] = []): Promise<QueryResult> => {
  return pool.query(text, params);
};

export const sql = sqlFunction;

export async function createTables() {
  try {
    // Create towers table first (referenced by other tables)
    await sql`
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
    `;

    // Create apartments table with foreign key to towers
    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        edad INTEGER CHECK (edad > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create booking_apartments table
    await sql`
      CREATE TABLE IF NOT EXISTS booking_apartments (
        id SERIAL PRIMARY KEY,
        apartamento_id INTEGER NOT NULL,
        torre_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        fecha_check_in DATE NOT NULL,
        fecha_check_out DATE NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (estado IN ('pending', 'confirmed', 'cancelled', 'completed')),
        noches INTEGER NOT NULL CHECK (noches > 0),
        tarifa_por_noche DECIMAL(10,2) NOT NULL CHECK (tarifa_por_noche > 0),
        tarifa_limpieza DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tarifa_limpieza >= 0),
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartamento_id) REFERENCES apartments(id) ON DELETE CASCADE,
        FOREIGN KEY (torre_id) REFERENCES towers(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT check_dates CHECK (fecha_check_out > fecha_check_in)
      );
    `;

    // Insert sample data for towers
    await sql`
      INSERT INTO towers (nombre, numero, descripcion, direccion, pisos, apartamentos_por_piso) VALUES 
      ('Torre Norte Premium', 'T001', 'Torre principal con vista al norte de la ciudad, acabados de lujo y amplios espacios comunes.', 'Avenida Principal 123, Zona Norte', 25, 4),
      ('Torre Sur Residencial', 'T002', 'Torre residencial familiar con áreas verdes y zona de juegos infantiles.', 'Calle Secundaria 456, Zona Sur', 15, 6),
      ('Torre Executive', 'T003', 'Torre ejecutiva con oficinas y apartamentos de alta gama, ubicación estratégica.', 'Boulevard Central 789, Centro Empresarial', 30, 2)
      ON CONFLICT (numero) DO NOTHING;
    `;

    // Insert sample data for apartments
    await sql`
      INSERT INTO apartments (nombre, numero, descripcion, torre_id) VALUES 
      ('Apartamento Premium Vista al Mar', 'A101', 'Hermoso apartamento de 3 habitaciones con vista panorámica al océano, completamente amueblado con acabados de lujo.', 1),
      ('Estudio Moderno Centro', 'B205', 'Acogedor estudio en el corazón de la ciudad, perfecto para profesionales jóvenes. Incluye cocina americana y balcón.', 1),
      ('Penthouse Ejecutivo', 'C501', 'Penthouse de lujo con terraza privada, 4 habitaciones, 3 baños y jacuzzi. Ubicación privilegiada.', 2)
      ON CONFLICT (numero) DO NOTHING;
    `;

    // Insert sample data for users
    await sql`
      INSERT INTO users (nombre, email, edad) VALUES 
      ('Juan Pérez', 'juan@email.com', 30),
      ('María García', 'maria@email.com', 28),
      ('Carlos Rodriguez', 'carlos@email.com', 35)
      ON CONFLICT (email) DO NOTHING;
    `;

    // Insert sample data for booking_apartments
    await sql`
      INSERT INTO booking_apartments (apartamento_id, torre_id, usuario_id, fecha_check_in, fecha_check_out, estado, noches, tarifa_por_noche, tarifa_limpieza, observaciones) VALUES 
      (1, 1, 1, '2024-03-15', '2024-03-20', 'confirmed', 5, 150000.00, 50000.00, 'Reserva familiar para vacaciones de semana santa'),
      (2, 1, 2, '2024-03-22', '2024-03-25', 'pending', 3, 120000.00, 40000.00, 'Viaje de negocios'),
      (3, 2, 3, '2024-04-01', '2024-04-10', 'confirmed', 9, 300000.00, 80000.00, 'Reserva de penthouse para luna de miel'),
      (1, 1, 2, '2024-04-15', '2024-04-18', 'pending', 3, 150000.00, 50000.00, 'Fin de semana largo'),
      (2, 1, 1, '2024-05-01', '2024-05-05', 'cancelled', 4, 120000.00, 40000.00, 'Cancelada por cambio de planes');
    `;

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_apartments_numero ON apartments(numero);
      CREATE INDEX IF NOT EXISTS idx_apartments_nombre ON apartments(nombre);
      CREATE INDEX IF NOT EXISTS idx_apartments_torre_id ON apartments(torre_id);
      CREATE INDEX IF NOT EXISTS idx_towers_numero ON towers(numero);
      CREATE INDEX IF NOT EXISTS idx_towers_nombre ON towers(nombre);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_nombre ON users(nombre);
      CREATE INDEX IF NOT EXISTS idx_bookings_apartamento_id ON booking_apartments(apartamento_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_torre_id ON booking_apartments(torre_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_usuario_id ON booking_apartments(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_fecha_check_in ON booking_apartments(fecha_check_in);
      CREATE INDEX IF NOT EXISTS idx_bookings_fecha_check_out ON booking_apartments(fecha_check_out);
      CREATE INDEX IF NOT EXISTS idx_bookings_estado ON booking_apartments(estado);
      CREATE INDEX IF NOT EXISTS idx_bookings_dates_range ON booking_apartments(fecha_check_in, fecha_check_out);
    `;

    console.log('All tables and sample data created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

export async function updateTimestamp(table: string, id: number) {
  if (table === 'apartments') {
    await sql`UPDATE apartments SET updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
  } else if (table === 'towers') {
    await sql`UPDATE towers SET updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
  } else if (table === 'users') {
    await sql`UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
  } else if (table === 'booking_apartments') {
    await sql`UPDATE booking_apartments SET updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
  }
}