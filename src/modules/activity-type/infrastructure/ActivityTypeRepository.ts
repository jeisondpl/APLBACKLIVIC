import { ApiError } from "@/app/lib/api-response";
import { ActivityType, ActivityTypeFilters } from "../domain/entities/activity-type.entity";
import { ActivityTypeRepository } from "../domain/models/activity-type.repository";
import { sql } from "@/lib/db";

export class PostgresActivityTypeRepository implements ActivityTypeRepository {
  async findAll(filters: ActivityTypeFilters) {
    try {
      let query = `
        SELECT id, nombre, descripcion, activo,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM activity_types
      `;
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (filters.search) {
        paramCount++;
        conditions.push(`(nombre ILIKE $${paramCount} OR descripcion ILIKE $${paramCount})`);
        params.push(`%${filters.search}%`);
      }

      if (filters.activo !== undefined) {
        paramCount++;
        conditions.push(`activo = $${paramCount}`);
        params.push(filters.activo);
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
        SELECT COUNT(*) as total FROM activity_types
        ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
      `;

      const [dataResult, countResult] = await Promise.all([
        sql.query(query, params),
        sql.query(countQuery, params.slice(0, params.length - 2))
      ]);

      return {
        data: dataResult.rows as ActivityType[],
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error in findAll2:', error);
      throw new ApiError('Error al obtener tipos de actividad', 500);
    }
  }

  async getById(id: number): Promise<ActivityType | null> {
    try {
      const result = await sql`
        SELECT id, nombre, descripcion, activo,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM activity_types 
        WHERE id = ${id}
      `;

      return result.rows[0] as ActivityType || null;
    } catch (error) {
      console.error('Error in getById:', error);
      throw new ApiError('Error al obtener tipo de actividad', 500);
    }
  }

  async create(activityType: ActivityType): Promise<ActivityType> {
    try {
      const existingResult = await sql`
        SELECT id FROM activity_types WHERE nombre = ${activityType.nombre}
      `;

      if (existingResult.rows.length > 0) {
        throw new ApiError("Nombre de tipo de actividad duplicado", 400);
      }

      const result = await sql`
        INSERT INTO activity_types (nombre, descripcion, activo)
        VALUES (${activityType.nombre}, ${activityType.descripcion}, ${activityType.activo})
        RETURNING id, nombre, descripcion, activo,
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      return result.rows[0] as ActivityType;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error in create:', error);
      throw new ApiError('Error al crear tipo de actividad', 500);
    }
  }

  async update(id: number, updateData: Partial<Omit<ActivityType, "id" | "createdAt" | "updatedAt">>): Promise<ActivityType | null> {
    try {
      if (updateData.nombre) {
        const existingResult = await sql`
          SELECT id FROM activity_types WHERE nombre = ${updateData.nombre} AND id != ${id}
        `;

        if (existingResult.rows.length > 0) {
          throw new ApiError("Nombre de tipo de actividad duplicado", 400);
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

      if (updateData.descripcion !== undefined) {
        paramCount++;
        fields.push(`descripcion = $${paramCount}`);
        values.push(updateData.descripcion);
      }

      if (updateData.activo !== undefined) {
        paramCount++;
        fields.push(`activo = $${paramCount}`);
        values.push(updateData.activo);
      }

      if (fields.length === 0) {
        return this.getById(id);
      }

      paramCount++;
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE activity_types 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, nombre, descripcion, activo,
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      const result = await sql.query(query, values);
      return result.rows[0] as ActivityType || null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error in update:', error);
      throw new ApiError('Error al actualizar tipo de actividad', 500);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM activity_types WHERE id = ${id}
      `;

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw new ApiError('Error al eliminar tipo de actividad', 500);
    }
  }
}