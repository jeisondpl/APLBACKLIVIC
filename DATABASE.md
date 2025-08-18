# Database Setup - LIVIC Project

## Opciones de Base de Datos

Este proyecto soporta dos opciones de base de datos:

1. **Memory Repositories** - Para desarrollo rápido (por defecto)
2. **PostgreSQL** - Para desarrollo local y producción

## Configuración Local con Docker

### 1. Levantar PostgreSQL con Docker Compose

```bash
# Levantar los servicios
docker-compose up -d

# Verificar que están ejecutándose
docker-compose ps
```

### 2. Servicios Disponibles

- **PostgreSQL**: `localhost:5432`
  - Usuario: `livic_user`
  - Contraseña: `livic_password`
  - Base de datos: `livic_db`

- **pgAdmin**: `localhost:8080`
  - Email: `admin@livic.com`
  - Contraseña: `admin123`

### 3. Configurar Variables de Entorno

El archivo `.env.local` ya está configurado para usar PostgreSQL local:

```bash
USE_POSTGRES=true
POSTGRES_URL="postgres://livic_user:livic_password@localhost:5432/livic_db"
# ... otras variables
```

### 4. Inicializar las Tablas

El proyecto incluye un endpoint para crear las tablas:

```bash
curl -X POST http://localhost:3001/api/init-db
```

O las tablas se crean automáticamente con el script `init.sql` cuando se levanta PostgreSQL por primera vez.

## Comandos Útiles

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs postgres
docker-compose logs pgadmin

# Detener servicios
docker-compose down

# Eliminar volúmenes (CUIDADO: borra todos los datos)
docker-compose down -v

# Reiniciar PostgreSQL
docker-compose restart postgres

# Conectar a PostgreSQL desde línea de comandos
docker exec -it livic-postgres psql -U livic_user -d livic_db
```

## Estructura de Base de Datos

### Tablas

1. **apartments**
   - `id` (SERIAL PRIMARY KEY)
   - `nombre` (VARCHAR(255))
   - `numero` (VARCHAR(50) UNIQUE)
   - `descripcion` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **towers**
   - `id` (SERIAL PRIMARY KEY)
   - `nombre` (VARCHAR(255))
   - `numero` (VARCHAR(50) UNIQUE)
   - `descripcion` (TEXT)
   - `direccion` (TEXT)
   - `pisos` (INTEGER)
   - `apartamentos_por_piso` (INTEGER)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

3. **users**
   - `id` (SERIAL PRIMARY KEY)
   - `nombre` (VARCHAR(255))
   - `email` (VARCHAR(255) UNIQUE)
   - `edad` (INTEGER)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

## Cambiar entre Memory y PostgreSQL

El proyecto usa el patrón Repository Factory para cambiar fácilmente entre implementaciones:

- Para usar **Memory**: establecer `USE_POSTGRES=false` o remover la variable
- Para usar **PostgreSQL**: establecer `USE_POSTGRES=true`

## Deployment en Vercel

Para producción en Vercel:

1. Conectar una base de datos PostgreSQL en el dashboard de Vercel
2. Las variables de entorno se configuran automáticamente
3. El proyecto detecta automáticamente el entorno de producción y usa PostgreSQL

## Troubleshooting

### Puerto 5432 ya en uso
```bash
# Encontrar qué proceso usa el puerto
lsof -i :5432

# Cambiar el puerto en docker-compose.yml
ports:
  - "5433:5432"
```

### Problemas de conexión
```bash
# Verificar que PostgreSQL está ejecutándose
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar el servicio
docker-compose restart postgres
```

### Resetear datos
```bash
# Eliminar volúmenes y recrear
docker-compose down -v
docker-compose up -d
```