import { ApiError } from "@/app/lib/api-response";
import { Apartment, ApartmentFilters } from "../domain/entities/apartment.entity";
import { ApartmentRepository } from "../domain/models/apartment.repository";
import { sql } from "@/lib/db";

export class PostgresApartmentRepository implements ApartmentRepository {
  async findAll(filters: ApartmentFilters) {
    try {
      let query = `
        SELECT a.id, a.nombre, a.numero, a.descripcion, a.torre_id as "torreId",
               a.created_at as "createdAt", a.updated_at as "updatedAt",
               t.id as "tower_id", t.nombre as "tower_nombre"
        FROM apartments a
        LEFT JOIN towers t ON a.torre_id = t.id
      `;
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (filters.search) {
        paramCount++;
        conditions.push(`(a.nombre ILIKE $${paramCount} OR a.descripcion ILIKE $${paramCount})`);
        params.push(`%${filters.search}%`);
      }

      if (filters.numero) {
        paramCount++;
        conditions.push(`a.numero = $${paramCount}`);
        params.push(filters.numero);
      }

      if (filters.torreId) {
        paramCount++;
        conditions.push(`a.torre_id = $${paramCount}`);
        params.push(filters.torreId);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY a.created_at DESC`;

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
        SELECT COUNT(*) as total FROM apartments a
        ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
      `;

      const [dataResult, countResult] = await Promise.all([
        sql.query(query, params),
        sql.query(countQuery, params.slice(0, params.length - 2))
      ]);

      const apartments = dataResult.rows.map((row: any) => ({
        id: row.id,
        nombre: row.nombre,
        numero: row.numero,
        descripcion: row.descripcion,
        torreId: row.torreId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        tower: row.tower_id ? {
          id: row.tower_id,
          nombre: row.tower_nombre
        } : undefined
      }));

      return {
        data: apartments as Apartment[],
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error in findAll3:', error);
      throw new ApiError('Error al obtener apartamentos', 500);
    }
  }

  async getById(id: number): Promise<Apartment | null> {
    try {
      const result = await sql`
        SELECT a.id, a.nombre, a.numero, a.descripcion, a.torre_id as "torreId",
               a.created_at as "createdAt", a.updated_at as "updatedAt",
               t.id as "tower_id", t.nombre as "tower_nombre"
        FROM apartments a
        LEFT JOIN towers t ON a.torre_id = t.id
        WHERE a.id = ${id}
      `;

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        nombre: row.nombre,
        numero: row.numero,
        descripcion: row.descripcion,
        torreId: row.torreId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        tower: row.tower_id ? {
          id: row.tower_id,
          nombre: row.tower_nombre
        } : undefined
      } as Apartment;
    } catch (error) {
      console.error('Error in getById:', error);
      throw new ApiError('Error al obtener apartamento', 500);
    }
  }

  async create(apartment: Apartment): Promise<Apartment> {
    try {
      const existingResult = await sql`
        SELECT id FROM apartments WHERE numero = ${apartment.numero}
      `;

      if (existingResult.rows.length > 0) {
        throw new ApiError("Número de apartamento duplicado", 400);
      }

      const insertResult = await sql`
        INSERT INTO apartments (nombre, numero, descripcion, torre_id)
        VALUES (${apartment.nombre}, ${apartment.numero}, ${apartment.descripcion}, ${apartment.torreId})
        RETURNING id
      `;

      const newId = insertResult.rows[0].id;
      return await this.getById(newId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error in create:', error);
      throw new ApiError('Error al crear apartamento', 500);
    }
  }

  async update(id: number, updateData: Partial<Omit<Apartment, "id" | "createdAt" | "updatedAt">>): Promise<Apartment | null> {
    try {
      if (updateData.numero) {
        const existingResult = await sql`
          SELECT id FROM apartments WHERE numero = ${updateData.numero} AND id != ${id}
        `;

        if (existingResult.rows.length > 0) {
          throw new ApiError("Número de apartamento duplicado", 400);
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

      if (updateData.numero !== undefined) {
        paramCount++;
        fields.push(`numero = $${paramCount}`);
        values.push(updateData.numero);
      }

      if (updateData.descripcion !== undefined) {
        paramCount++;
        fields.push(`descripcion = $${paramCount}`);
        values.push(updateData.descripcion);
      }

      if (updateData.torreId !== undefined) {
        paramCount++;
        fields.push(`torre_id = $${paramCount}`);
        values.push(updateData.torreId);
      }

      if (fields.length === 0) {
        return this.getById(id);
      }

      paramCount++;
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE apartments 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
      `;

      const result = await sql.query(query, values);
      if ((result.rowCount ?? 0) === 0) return null;

      return await this.getById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error in update:', error);
      throw new ApiError('Error al actualizar apartamento', 500);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM apartments WHERE id = ${id}
      `;

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw new ApiError('Error al eliminar apartamento', 500);
    }
  }

  async updateMany(list: Partial<Apartment>[]): Promise<{ updated: Apartment[], errors?: string[] }> {
    const updated: Apartment[] = [];
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
          errors.push(`Apartamento con ID ${item.id} no encontrado`);
        }
      } catch (error) {
        errors.push(`Error actualizando ID ${item.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return { updated, errors: errors.length ? errors : undefined };
  }

  async deleteMany(ids: number[]): Promise<{ deleted: Apartment[], notFound?: number[] }> {
    const deleted: Apartment[] = [];
    const notFound: number[] = [];

    for (const id of ids) {
      try {
        const apartment = await this.getById(id);
        if (!apartment) {
          notFound.push(id);
          continue;
        }

        const wasDeleted = await this.delete(id);
        if (wasDeleted) {
          deleted.push(apartment);
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