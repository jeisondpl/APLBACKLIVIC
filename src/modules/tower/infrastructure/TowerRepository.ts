import { ApiError } from "@/app/lib/api-response";
import { Tower, TowerFilters } from "../domain/entities/tower.entity";
import { TowerRepository } from "../domain/models/tower.repository";
import { sql } from "@/lib/db";

export class PostgresTowerRepository implements TowerRepository {
  async getAll(filters: TowerFilters) {
    try {
      let query = `
        SELECT id, nombre, numero, descripcion, direccion, pisos, apartamentos_por_piso as "apartamentosPorPiso",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM towers
      `;
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (filters.search) {
        paramCount++;
        conditions.push(`(nombre ILIKE $${paramCount} OR descripcion ILIKE $${paramCount} OR direccion ILIKE $${paramCount})`);
        params.push(`%${filters.search}%`);
      }

      if (filters.numero) {
        paramCount++;
        conditions.push(`numero = $${paramCount}`);
        params.push(filters.numero);
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
        SELECT COUNT(*) as total FROM towers
        ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
      `;

      const [dataResult, countResult] = await Promise.all([
        sql.query(query, params),
        sql.query(countQuery, params.slice(0, params.length - 2))
      ]);

      return {
        data: dataResult.rows as Tower[],
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error in getAll:', error);
      throw new ApiError('Error al obtener torres', 500);
    }
  }

  async getById(id: number): Promise<Tower | null> {
    try {
      const result = await sql`
        SELECT id, nombre, numero, descripcion, direccion, pisos, apartamentos_por_piso as "apartamentosPorPiso",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM towers 
        WHERE id = ${id}
      `;

      return result.rows[0] as Tower || null;
    } catch (error) {
      console.error('Error in getById:', error);
      throw new ApiError('Error al obtener torre', 500);
    }
  }

  async create(towerData: Omit<Tower, "id" | "createdAt" | "updatedAt">): Promise<Tower> {
    try {
      const existingResult = await sql`
        SELECT id FROM towers WHERE numero = ${towerData.numero}
      `;

      if (existingResult.rows.length > 0) {
        throw new ApiError("Número de torre duplicado", 400);
      }

      const result = await sql`
        INSERT INTO towers (nombre, numero, descripcion, direccion, pisos, apartamentos_por_piso)
        VALUES (${towerData.nombre}, ${towerData.numero}, ${towerData.descripcion}, 
                ${towerData.direccion}, ${towerData.pisos}, ${towerData.apartamentosPorPiso})
        RETURNING id, nombre, numero, descripcion, direccion, pisos, apartamentos_por_piso as "apartamentosPorPiso",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      return result.rows[0] as Tower;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error in create:', error);
      throw new ApiError('Error al crear torre', 500);
    }
  }

  async update(id: number, updateData: Partial<Omit<Tower, "id" | "createdAt" | "updatedAt">>): Promise<Tower | null> {
    try {
      if (updateData.numero) {
        const existingResult = await sql`
          SELECT id FROM towers WHERE numero = ${updateData.numero} AND id != ${id}
        `;

        if (existingResult.rows.length > 0) {
          throw new ApiError("Número de torre duplicado", 400);
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

      if (updateData.direccion !== undefined) {
        paramCount++;
        fields.push(`direccion = $${paramCount}`);
        values.push(updateData.direccion);
      }

      if (updateData.pisos !== undefined) {
        paramCount++;
        fields.push(`pisos = $${paramCount}`);
        values.push(updateData.pisos);
      }

      if (updateData.apartamentosPorPiso !== undefined) {
        paramCount++;
        fields.push(`apartamentos_por_piso = $${paramCount}`);
        values.push(updateData.apartamentosPorPiso);
      }

      if (fields.length === 0) {
        return this.getById(id);
      }

      paramCount++;
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE towers 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, nombre, numero, descripcion, direccion, pisos, apartamentos_por_piso as "apartamentosPorPiso",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      const result = await sql.query(query, values);
      return result.rows[0] as Tower || null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error in update:', error);
      throw new ApiError('Error al actualizar torre', 500);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM towers WHERE id = ${id}
      `;

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw new ApiError('Error al eliminar torre', 500);
    }
  }
}