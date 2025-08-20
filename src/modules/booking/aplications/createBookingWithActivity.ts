import { BookingRepository } from '../domain/models/BookingRepository';
import { BookingApartment, CreateBookingWithActivityRequest } from '../domain/entities/booking.entity';
import { validateCreateBooking } from '../domain/validations/booking.schema';
import { ActivityRepository } from '../../activity/domain/models/activity.repository';
import { Activity, ActivityStatus, ActivityPriority } from '../../activity/domain/entities/activity.entity';

export class CreateBookingWithActivity {
    constructor(
        private bookingRepository: BookingRepository,
        private activityRepository: ActivityRepository
    ) {}

    async execute(data: CreateBookingWithActivityRequest): Promise<{
        booking: BookingApartment;
        activity?: Activity;
    }> {
        // Validate booking data
        const validatedBookingData = validateCreateBooking(data);
        
        // Create the booking first
        const booking = await this.bookingRepository.create(validatedBookingData);
        
        let activity: Activity | undefined;
        
        // Create activity if requested
        if (data.createActivity && data.activityData) {
            const activityData: Activity = {
                id: 0, // Will be set by the repository
                nombre: data.activityData.nombre,
                tipoId: data.activityData.tipoId,
                descripcion: data.activityData.descripcion,
                apartamentoId: booking.apartamentoId,
                torreId: booking.torreId,
                usuarioAsignadoId: data.activityData.usuarioAsignadoId || booking.usuarioId,
                estado: ActivityStatus.PENDIENTE,
                prioridad: (data.activityData.prioridad as ActivityPriority) || ActivityPriority.MEDIA,
                fechaProgramada: data.activityData.fechaProgramada || booking.fechaCheckIn,
                fechaCompletada: undefined,
                notas: data.activityData.notas || `Actividad creada automáticamente para la reserva #${booking.id}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            activity = await this.activityRepository.create(activityData);
        }
        
        return {
            booking,
            activity
        };
    }
}