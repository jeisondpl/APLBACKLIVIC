import { ApiError } from "@/app/lib/api-response";
import { Activity, ActivityFilters } from "../domain/entities/activity.entity";
import { ActivityRepository } from "../domain/models/activity.repository";
import { sql } from "@/lib/db";

export class PostgresActivityRepository implements ActivityRepository {
  async findAll(filters: ActivityFilters) {
    try {
      let query = `
        SELECT id, nombre, tipo_actividad_id as "tipoId", descripcion, apartamento_id as "apartamentoId", 
               torre_id as "torreId", usuario_asignado_id as "usuarioAsignadoId",
               estado, prioridad, fecha_programada as "fechaProgramada", fecha_completada as "fechaCompletada",
               notas, created_at as "createdAt", updated_at as "updatedAt"
        FROM activities
      `;
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (filters.search) {
        paramCount++;
        conditions.push(`(nombre ILIKE $${paramCount} OR descripcion ILIKE $${paramCount})`);
        params.push(`%${filters.search}%`);
      }

      if (filters.tipoId) {
        paramCount++;
        conditions.push(`tipo_actividad_id = $${paramCount}`);
        params.push(filters.tipoId);
      }

      if (filters.estado) {
        paramCount++;
        conditions.push(`estado = $${paramCount}`);
        params.push(filters.estado);
      }

      if (filters.apartamentoId) {
        paramCount++;
        conditions.push(`apartamento_id = $${paramCount}`);
        params.push(filters.apartamentoId);
      }

      if (filters.torreId) {
        paramCount++;
        conditions.push(`torre_id = $${paramCount}`);
        params.push(filters.torreId);
      }

      if (filters.usuarioAsignadoId) {
        paramCount++;
        conditions.push(`usuario_asignado_id = $${paramCount}`);
        params.push(filters.usuarioAsignadoId);
      }

      if (filters.fechaDesde) {
        paramCount++;
        conditions.push(`fecha_programada >= $${paramCount}`);
        params.push(filters.fechaDesde);
      }

      if (filters.fechaHasta) {
        paramCount++;
        conditions.push(`fecha_programada <= $${paramCount}`);
        params.push(filters.fechaHasta);
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
        SELECT COUNT(*) as total FROM activities
        ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
      `;

      const [dataResult, countResult] = await Promise.all([
        sql.query(query, params),
        sql.query(countQuery, params.slice(0, params.length - 2))
      ]);

      return {
        data: dataResult.rows as Activity[],
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error in findAll1:', error);
      throw new ApiError('Error al obtener actividades', 500);
    }
  }

  async getById(id: number): Promise<Activity | null> {
    try {
      const result = await sql`
        SELECT id, nombre, tipo_actividad_id as "tipoId", descripcion, apartamento_id as "apartamentoId", 
               torre_id as "torreId", usuario_asignado_id as "usuarioAsignadoId",
               estado, prioridad, fecha_programada as "fechaProgramada", fecha_completada as "fechaCompletada",
               notas, created_at as "createdAt", updated_at as "updatedAt"
        FROM activities 
        WHERE id = ${id}
      `;

      return result.rows[0] as Activity || null;
    } catch (error) {
      console.error('Error in getById:', error);
      throw new ApiError('Error al obtener actividad', 500);
    }
  }

  async create(activity: Activity): Promise<Activity> {
    try {
      const result = await sql`
        INSERT INTO activities (nombre, tipo_actividad_id, descripcion, apartamento_id, torre_id, 
                               usuario_asignado_id, estado, prioridad, fecha_programada, fecha_completada, notas)
        VALUES (${activity.nombre}, ${activity.tipoId}, ${activity.descripcion}, 
                ${activity.apartamentoId || null}, ${activity.torreId || null}, 
                ${activity.usuarioAsignadoId || null}, ${activity.estado}, 
                ${activity.prioridad || 'MEDIA'}, ${activity.fechaProgramada || null}, 
                ${activity.fechaCompletada || null}, ${activity.notas || null})
        RETURNING id, nombre, tipo_actividad_id as "tipoId", descripcion, apartamento_id as "apartamentoId", 
                  torre_id as "torreId", usuario_asignado_id as "usuarioAsignadoId",
                  estado, prioridad, fecha_programada as "fechaProgramada", fecha_completada as "fechaCompletada",
                  notas, created_at as "createdAt", updated_at as "updatedAt"
      `;

      return result.rows[0] as Activity;
    } catch (error) {
      console.error('Error in create:', error);
      throw new ApiError('Error al crear actividad', 500);
    }
  }

  async update(id: number, updateData: Partial<Omit<Activity, "id" | "createdAt" | "updatedAt">>): Promise<Activity | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      if (updateData.nombre !== undefined) {
        paramCount++;
        fields.push(`nombre = $${paramCount}`);
        values.push(updateData.nombre);
      }

      if (updateData.tipoId !== undefined) {
        paramCount++;
        fields.push(`tipo_actividad_id = $${paramCount}`);
        values.push(updateData.tipoId);
      }

      if (updateData.descripcion !== undefined) {
        paramCount++;
        fields.push(`descripcion = $${paramCount}`);
        values.push(updateData.descripcion);
      }

      if (updateData.apartamentoId !== undefined) {
        paramCount++;
        fields.push(`apartamento_id = $${paramCount}`);
        values.push(updateData.apartamentoId);
      }

      if (updateData.torreId !== undefined) {
        paramCount++;
        fields.push(`torre_id = $${paramCount}`);
        values.push(updateData.torreId);
      }

      if (updateData.usuarioAsignadoId !== undefined) {
        paramCount++;
        fields.push(`usuario_asignado_id = $${paramCount}`);
        values.push(updateData.usuarioAsignadoId);
      }

      if (updateData.estado !== undefined) {
        paramCount++;
        fields.push(`estado = $${paramCount}`);
        values.push(updateData.estado);
      }

      if (updateData.prioridad !== undefined) {
        paramCount++;
        fields.push(`prioridad = $${paramCount}`);
        values.push(updateData.prioridad);
      }

      if (updateData.fechaProgramada !== undefined) {
        paramCount++;
        fields.push(`fecha_programada = $${paramCount}`);
        values.push(updateData.fechaProgramada);
      }

      if (updateData.fechaCompletada !== undefined) {
        paramCount++;
        fields.push(`fecha_completada = $${paramCount}`);
        values.push(updateData.fechaCompletada);
      }

      if (updateData.notas !== undefined) {
        paramCount++;
        fields.push(`notas = $${paramCount}`);
        values.push(updateData.notas);
      }

      if (fields.length === 0) {
        return this.getById(id);
      }

      paramCount++;
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE activities 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, nombre, tipo_actividad_id as "tipoId", descripcion, apartamento_id as "apartamentoId", 
                  torre_id as "torreId", usuario_asignado_id as "usuarioAsignadoId",
                  estado, prioridad, fecha_programada as "fechaProgramada", fecha_completada as "fechaCompletada",
                  notas, created_at as "createdAt", updated_at as "updatedAt"
      `;

      const result = await sql.query(query, values);
      return result.rows[0] as Activity || null;
    } catch (error) {
      console.error('Error in update:', error);
      throw new ApiError('Error al actualizar actividad', 500);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM activities WHERE id = ${id}
      `;

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw new ApiError('Error al eliminar actividad', 500);
    }
  }

  async updateMany(list: Partial<Activity>[]): Promise<{ updated: Activity[], errors?: string[] }> {
    const updated: Activity[] = [];
    const errors: string[] = [];

    for (const item of list) {
      try {
        if (!item.id) {
          errors.push('ID requerido para actualización');
          continue;
        }

        const result = await this.update(item.id, item);
        if (result) {
          updated.push(result);
        } else {
          errors.push(`Actividad con ID ${item.id} no encontrada`);
        }
      } catch (error) {
        errors.push(`Error actualizando ID ${item.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return { updated, errors: errors.length ? errors : undefined };
  }

  async deleteMany(ids: number[]): Promise<{ deleted: Activity[], notFound?: number[] }> {
    const deleted: Activity[] = [];
    const notFound: number[] = [];

    for (const id of ids) {
      try {
        const activity = await this.getById(id);
        if (!activity) {
          notFound.push(id);
          continue;
        }

        const wasDeleted = await this.delete(id);
        if (wasDeleted) {
          deleted.push(activity);
        } else {
          notFound.push(id);
        }
      } catch {
        notFound.push(id);
      }
    }

    return { deleted, notFound: notFound.length ? notFound : undefined };
  }
}