import { sql } from '@/lib/db';
import { BookingRepository } from "../domain/models/BookingRepository";
import { BookingApartment, CreateBookingRequest, UpdateBookingRequest, BookingFilters, BookingStatus, calculateNights } from "../domain/entities/booking.entity";

export class PostgresBookingRepository implements BookingRepository {
    
    async findAll(filters: BookingFilters): Promise<{ data: BookingApartment[], total: number }> {
        let query = `
            SELECT 
                ba.*,
                a.nombre as apartamento_nombre,
                a.numero as apartamento_numero,
                t.nombre as torre_nombre,
                u.nombre as usuario_nombre,
                u.email as usuario_email
            FROM booking_apartments ba
            LEFT JOIN apartments a ON ba.apartamento_id = a.id
            LEFT JOIN towers t ON ba.torre_id = t.id
            LEFT JOIN users u ON ba.usuario_id = u.id
            WHERE 1=1
        `;
        
        const params: any[] = [];
        let paramIndex = 1;

        // Apply filters
        if (filters.search) {
            query += ` AND (ba.observaciones ILIKE $${paramIndex} OR a.nombre ILIKE $${paramIndex} OR a.numero ILIKE $${paramIndex} OR t.nombre ILIKE $${paramIndex} OR u.nombre ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        if (filters.apartamentoId) {
            query += ` AND ba.apartamento_id = $${paramIndex}`;
            params.push(filters.apartamentoId);
            paramIndex++;
        }

        if (filters.torreId) {
            query += ` AND ba.torre_id = $${paramIndex}`;
            params.push(filters.torreId);
            paramIndex++;
        }

        if (filters.usuarioId) {
            query += ` AND ba.usuario_id = $${paramIndex}`;
            params.push(filters.usuarioId);
            paramIndex++;
        }

        if (filters.estado) {
            query += ` AND ba.estado = $${paramIndex}`;
            params.push(filters.estado);
            paramIndex++;
        }

        if (filters.fechaCheckInDesde) {
            query += ` AND ba.fecha_check_in >= $${paramIndex}`;
            params.push(filters.fechaCheckInDesde);
            paramIndex++;
        }

        if (filters.fechaCheckInHasta) {
            query += ` AND ba.fecha_check_in <= $${paramIndex}`;
            params.push(filters.fechaCheckInHasta);
            paramIndex++;
        }

        if (filters.fechaCheckOutDesde) {
            query += ` AND ba.fecha_check_out >= $${paramIndex}`;
            params.push(filters.fechaCheckOutDesde);
            paramIndex++;
        }

        if (filters.fechaCheckOutHasta) {
            query += ` AND ba.fecha_check_out <= $${paramIndex}`;
            params.push(filters.fechaCheckOutHasta);
            paramIndex++;
        }

        // Get total count
        const countQuery = query.replace(
            /SELECT[\s\S]*?FROM/,
            'SELECT COUNT(*) as total FROM'
        );
        
        const countResult = await sql.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Add ordering and pagination
        query += ` ORDER BY ba.created_at DESC`;
        
        const limit = filters.limit || 10;
        const page = filters.page || 1;
        const offset = (page - 1) * limit;
        
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await sql.query(query, params);
        
        const data = result.rows.map(row => this.mapRowToBooking(row));
        
        return { data, total };
    }

    async findById(id: number): Promise<BookingApartment | null> {
        const query = `
            SELECT 
                ba.*,
                a.nombre as apartamento_nombre,
                a.numero as apartamento_numero,
                t.nombre as torre_nombre,
                u.nombre as usuario_nombre,
                u.email as usuario_email
            FROM booking_apartments ba
            LEFT JOIN apartments a ON ba.apartamento_id = a.id
            LEFT JOIN towers t ON ba.torre_id = t.id
            LEFT JOIN users u ON ba.usuario_id = u.id
            WHERE ba.id = $1
        `;
        
        const result = await sql.query(query, [id]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return this.mapRowToBooking(result.rows[0]);
    }

    async create(bookingData: CreateBookingRequest): Promise<BookingApartment> {
        const noches = calculateNights(bookingData.fechaCheckIn, bookingData.fechaCheckOut);
        const estado = bookingData.estado || BookingStatus.PENDING;
        
        const query = `
            INSERT INTO booking_apartments 
            (apartamento_id, torre_id, usuario_id, fecha_check_in, fecha_check_out, estado, noches, tarifa_por_noche, tarifa_limpieza, observaciones)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        
        const params = [
            bookingData.apartamentoId,
            bookingData.torreId,
            bookingData.usuarioId,
            bookingData.fechaCheckIn,
            bookingData.fechaCheckOut,
            estado,
            noches,
            bookingData.tarifaPorNoche,
            bookingData.tarifaLimpieza,
            bookingData.observaciones
        ];
        
        const result = await sql.query(query, params);
        const createdBooking = await this.findById(result.rows[0].id);
        
        if (!createdBooking) {
            throw new Error('Failed to retrieve created booking');
        }
        
        return createdBooking;
    }

    async update(id: number, bookingData: UpdateBookingRequest): Promise<BookingApartment> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Booking with id ${id} not found`);
        }

        const updates: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (bookingData.apartamentoId !== undefined) {
            updates.push(`apartamento_id = $${paramIndex}`);
            params.push(bookingData.apartamentoId);
            paramIndex++;
        }

        if (bookingData.torreId !== undefined) {
            updates.push(`torre_id = $${paramIndex}`);
            params.push(bookingData.torreId);
            paramIndex++;
        }

        if (bookingData.usuarioId !== undefined) {
            updates.push(`usuario_id = $${paramIndex}`);
            params.push(bookingData.usuarioId);
            paramIndex++;
        }

        if (bookingData.fechaCheckIn !== undefined) {
            updates.push(`fecha_check_in = $${paramIndex}`);
            params.push(bookingData.fechaCheckIn);
            paramIndex++;
        }

        if (bookingData.fechaCheckOut !== undefined) {
            updates.push(`fecha_check_out = $${paramIndex}`);
            params.push(bookingData.fechaCheckOut);
            paramIndex++;
        }

        if (bookingData.estado !== undefined) {
            updates.push(`estado = $${paramIndex}`);
            params.push(bookingData.estado);
            paramIndex++;
        }

        if (bookingData.tarifaPorNoche !== undefined) {
            updates.push(`tarifa_por_noche = $${paramIndex}`);
            params.push(bookingData.tarifaPorNoche);
            paramIndex++;
        }

        if (bookingData.tarifaLimpieza !== undefined) {
            updates.push(`tarifa_limpieza = $${paramIndex}`);
            params.push(bookingData.tarifaLimpieza);
            paramIndex++;
        }

        if (bookingData.observaciones !== undefined) {
            updates.push(`observaciones = $${paramIndex}`);
            params.push(bookingData.observaciones);
            paramIndex++;
        }

        // Calculate new nights if dates are being updated
        const newCheckIn = bookingData.fechaCheckIn || existing.fechaCheckIn;
        const newCheckOut = bookingData.fechaCheckOut || existing.fechaCheckOut;
        
        if (bookingData.fechaCheckIn || bookingData.fechaCheckOut) {
            const noches = calculateNights(newCheckIn, newCheckOut);
            updates.push(`noches = $${paramIndex}`);
            params.push(noches);
            paramIndex++;
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(id);

        const query = `
            UPDATE booking_apartments 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        await sql.query(query, params);
        
        const updatedBooking = await this.findById(id);
        if (!updatedBooking) {
            throw new Error('Failed to retrieve updated booking');
        }
        
        return updatedBooking;
    }

    async delete(id: number): Promise<boolean> {
        const query = `DELETE FROM booking_apartments WHERE id = $1`;
        const result = await sql.query(query, [id]);
        return result.rowCount > 0;
    }

    async findByApartmentAndDateRange(apartamentoId: number, fechaCheckIn: string, fechaCheckOut: string): Promise<BookingApartment[]> {
        const query = `
            SELECT 
                ba.*,
                a.nombre as apartamento_nombre,
                a.numero as apartamento_numero,
                t.nombre as torre_nombre,
                u.nombre as usuario_nombre,
                u.email as usuario_email
            FROM booking_apartments ba
            LEFT JOIN apartments a ON ba.apartamento_id = a.id
            LEFT JOIN towers t ON ba.torre_id = t.id
            LEFT JOIN users u ON ba.usuario_id = u.id
            WHERE ba.apartamento_id = $1 
            AND ba.estado != 'cancelled'
            AND NOT (
                $3 <= ba.fecha_check_in OR 
                $2 >= ba.fecha_check_out
            )
            ORDER BY ba.fecha_check_in
        `;
        
        const result = await sql.query(query, [apartamentoId, fechaCheckIn, fechaCheckOut]);
        return result.rows.map(row => this.mapRowToBooking(row));
    }

    async findByUserAndDateRange(usuarioId: number, fechaDesde?: string, fechaHasta?: string): Promise<BookingApartment[]> {
        let query = `
            SELECT 
                ba.*,
                a.nombre as apartamento_nombre,
                a.numero as apartamento_numero,
                t.nombre as torre_nombre,
                u.nombre as usuario_nombre,
                u.email as usuario_email
            FROM booking_apartments ba
            LEFT JOIN apartments a ON ba.apartamento_id = a.id
            LEFT JOIN towers t ON ba.torre_id = t.id
            LEFT JOIN users u ON ba.usuario_id = u.id
            WHERE ba.usuario_id = $1
        `;
        
        const params: any[] = [usuarioId];
        let paramIndex = 2;

        if (fechaDesde) {
            query += ` AND ba.fecha_check_in >= $${paramIndex}`;
            params.push(fechaDesde);
            paramIndex++;
        }

        if (fechaHasta) {
            query += ` AND ba.fecha_check_out <= $${paramIndex}`;
            params.push(fechaHasta);
            paramIndex++;
        }

        query += ` ORDER BY ba.fecha_check_in`;
        
        const result = await sql.query(query, params);
        return result.rows.map(row => this.mapRowToBooking(row));
    }

    private mapRowToBooking(row: any): BookingApartment {
        return {
            id: row.id,
            apartamentoId: row.apartamento_id,
            torreId: row.torre_id,
            usuarioId: row.usuario_id,
            fechaCheckIn: row.fecha_check_in,
            fechaCheckOut: row.fecha_check_out,
            estado: row.estado as BookingStatus,
            noches: row.noches,
            tarifaPorNoche: parseFloat(row.tarifa_por_noche) || 0,
            tarifaLimpieza: parseFloat(row.tarifa_limpieza) || 0,
            observaciones: row.observaciones,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            apartamento: row.apartamento_nombre ? {
                id: row.apartamento_id,
                nombre: row.apartamento_nombre,
                numero: row.apartamento_numero
            } : undefined,
            torre: row.torre_nombre ? {
                id: row.torre_id,
                nombre: row.torre_nombre
            } : undefined,
            usuario: row.usuario_nombre ? {
                id: row.usuario_id,
                nombre: row.usuario_nombre,
                email: row.usuario_email
            } : undefined
        };
    }
}