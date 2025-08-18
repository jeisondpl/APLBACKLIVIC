# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server (typically runs on port 3001 if 3000 is occupied)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Database setup (local PostgreSQL)
docker-compose up -d

# Initialize database tables
curl -X POST http://localhost:3001/api/init-db
```

## Architecture Overview

This is a Next.js 15 project using **Hexagonal Architecture** with a modular domain-driven design. The project implements a real estate management system with three main entities: apartments, towers, and users.

### Core Architectural Patterns

1. **Hexagonal Architecture**: Clear separation between domain, application, and infrastructure layers
2. **Repository Pattern**: Abstraction for data persistence with switchable implementations
3. **Factory Pattern**: `RepositoryFactory` enables switching between Memory and PostgreSQL repositories
4. **Use Case Pattern**: Business logic encapsulated in application services

### Module Structure

Each domain module follows the same structure:
```
src/modules/{entity}/
├── domain/
│   ├── entities/        # Domain entities and interfaces
│   ├── models/          # Repository interfaces
│   └── validations/     # Zod schemas and validation functions
├── aplications/         # Use cases (business logic)
└── infrastructure/      # Repository implementations
```

### Database Strategy

The project supports dual database implementations:

- **Memory Repositories**: Default for development, data stored in arrays
- **PostgreSQL Repositories**: Production-ready with `@vercel/postgres`

Control via environment variable:
- `USE_POSTGRES=true` → PostgreSQL
- `USE_POSTGRES=false` or unset → Memory

### API Structure

REST endpoints follow RESTful conventions:
- `GET /api/{entity}` - List with filters (search, pagination)
- `POST /api/{entity}` - Create new entity
- `GET /api/{entity}/[id]` - Get by ID
- `PUT /api/{entity}/[id]` - Update by ID
- `DELETE /api/{entity}/[id]` - Delete by ID

All APIs use:
- Zod validation for input
- Consistent response format via `createApiResponse`
- Error handling via `handleApiError`

### Key Technologies

- **Next.js 15**: App Router with API routes
- **TypeScript**: Strict typing throughout
- **Zod**: Runtime validation and type inference
- **@vercel/postgres**: Database client for PostgreSQL
- **Docker Compose**: Local development database

### Repository Factory Usage

All API endpoints use `RepositoryFactory` instead of direct repository instantiation:

```typescript
// Good
const repo = RepositoryFactory.createApartmentRepository();

// Avoid
const repo = new MemoryApartmentRepository();
```

### Database Configuration

Local development uses Docker Compose with PostgreSQL + pgAdmin. The `init.sql` script creates tables and sample data automatically.

Environment files:
- `.env.local` - Local development with PostgreSQL
- `.env.example` - Template for production (Vercel)

### Next.js 15 Specifics

- **Dynamic route params**: Must be awaited (`const { id } = await params`)
- **App Router**: All APIs in `src/app/api/`
- **TypeScript**: Strict mode enabled

### Validation Pattern

Each domain has Zod schemas with helper functions:
```typescript
export function validateCreateEntity(data: unknown): CreateEntityRequest {
  const parsed = CreateEntitySchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => e.message).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}
```

### Error Handling

- Custom `ApiError` class for business logic errors
- Centralized error handling in `handleApiError`
- Consistent HTTP status codes and error messages

When adding new entities, follow the existing module structure and use the Repository Factory pattern for consistent architecture.