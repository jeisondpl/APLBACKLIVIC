import { ApiError } from "@/app/lib/api-response";
import { User, UserFilters } from "../domain/entities/user.entity";
import { UserRepository } from "../domain/models/user.repository";
import { sql } from "@/lib/db";

export class PostgresUserRepository implements UserRepository {
  async getAll(filters: UserFilters) {
    try {
      let query = `
        SELECT id, nombre, email, edad,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM users
      `;
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (filters.search) {
        paramCount++;
        conditions.push(`(nombre ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
        params.push(`%${filters.search}%`);
      }

      if (filters.email) {
        paramCount++;
        conditions.push(`email = $${paramCount}`);
        params.push(filters.email);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY created_at DESC`;

      const page = filters.page ?? 1;
      const limit = filters.limit ?? 10;
      const offset = (page - 1) * limit;

      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      const countQuery = `
        SELECT COUNT(*) as total FROM users
        ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
      `;

      const [dataResult, countResult] = await Promise.all([
        sql.query(query, params),
        sql.query(countQuery, params.slice(0, params.length - 2))
      ]);

      return {
        data: dataResult.rows as User[],
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error in getAll:', error);
      throw new ApiError('Error al obtener usuarios', 500);
    }
  }

  async getById(id: number): Promise<User | null> {
    try {
      const result = await sql`
        SELECT id, nombre, email, edad,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM users 
        WHERE id = ${id}
      `;

      return result.rows[0] as User || null;
    } catch (error) {
      console.error('Error in getById:', error);
      throw new ApiError('Error al obtener usuario', 500);
    }
  }

  async create(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    try {
      const existingResult = await sql`
        SELECT id FROM users WHERE email = ${userData.email}
      `;

      if (existingResult.rows.length > 0) {
        throw new ApiError("Email ya está registrado", 400);
      }

      const result = await sql`
        INSERT INTO users (nombre, email, edad)
        VALUES (${userData.nombre}, ${userData.email}, ${userData.edad})
        RETURNING id, nombre, email, edad,
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      return result.rows[0] as User;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error in create:', error);
      throw new ApiError('Error al crear usuario', 500);
    }
  }

  async update(id: number, updateData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User | null> {
    try {
      if (updateData.email) {
        const existingResult = await sql`
          SELECT id FROM users WHERE email = ${updateData.email} AND id != ${id}
        `;

        if (existingResult.rows.length > 0) {
          throw new ApiError("Email ya está registrado", 400);
        }
      }

      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      if (updateData.nombre !== undefined) {
        paramCount++;
        fields.push(`nombre = $${paramCount}`);
        values.push(updateData.nombre);
      }

      if (updateData.email !== undefined) {
        paramCount++;
        fields.push(`email = $${paramCount}`);
        values.push(updateData.email);
      }

      if (updateData.edad !== undefined) {
        paramCount++;
        fields.push(`edad = $${paramCount}`);
        values.push(updateData.edad);
      }

      if (fields.length === 0) {
        return this.getById(id);
      }

      paramCount++;
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE users 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, nombre, email, edad,
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      const result = await sql.query(query, values);
      return result.rows[0] as User || null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error in update:', error);
      throw new ApiError('Error al actualizar usuario', 500);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM users WHERE id = ${id}
      `;

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw new ApiError('Error al eliminar usuario', 500);
    }
  }
}