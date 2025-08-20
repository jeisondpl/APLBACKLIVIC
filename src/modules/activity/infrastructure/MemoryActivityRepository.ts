import { ActivityRepository } from "../domain/models/activity.repository";
import { Activity, ActivityFilters, ActivityStatus, ActivityPriority } from "../domain/entities/activity.entity";

export class MemoryActivityRepository implements ActivityRepository {
    private activities: Activity[] = [
        {
            id: 1,
            nombre: "Limpieza general apartamento 101",
            tipoId: 1,
            descripcion: "Limpieza completa del apartamento después del check-out",
            apartamentoId: 1,
            torreId: 1,
            usuarioAsignadoId: 1,
            estado: ActivityStatus.COMPLETADA,
            prioridad: ActivityPriority.ALTA,
            fechaProgramada: "2024-03-14",
            fechaCompletada: "2024-03-14",
            notas: "Limpieza realizada sin novedades",
            createdAt: "2024-01-15T09:00:00.000Z",
            updatedAt: "2024-01-15T16:00:00.000Z"
        },
        {
            id: 2,
            nombre: "Mantenimiento preventivo",
            tipoId: 2,
            descripcion: "Revisión mensual de sistemas eléctricos y plomería",
            apartamentoId: 2,
            torreId: 1,
            usuarioAsignadoId: 2,
            estado: ActivityStatus.EN_PROGRESO,
            prioridad: ActivityPriority.MEDIA,
            fechaProgramada: "2024-03-16",
            notas: "En progreso, revisando sistema eléctrico",
            createdAt: "2024-01-10T08:00:00.000Z",
            updatedAt: "2024-03-16T10:00:00.000Z"
        },
        {
            id: 3,
            nombre: "Preparación para nuevo huésped",
            tipoId: 1,
            descripcion: "Preparación completa del penthouse para llegada VIP",
            apartamentoId: 3,
            torreId: 2,
            usuarioAsignadoId: 3,
            estado: ActivityStatus.PENDIENTE,
            prioridad: ActivityPriority.ALTA,
            fechaProgramada: "2024-03-31",
            notas: "Requiere atención especial, huésped VIP",
            createdAt: "2024-01-20T12:00:00.000Z",
            updatedAt: "2024-01-20T12:00:00.000Z"
        }
    ];

    private nextId = 4;

    async findAll(filters: ActivityFilters): Promise<{ data: Activity[], total: number }> {
        let filteredActivities = [...this.activities];

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredActivities = filteredActivities.filter(activity =>
                activity.nombre.toLowerCase().includes(searchLower) ||
                activity.descripcion.toLowerCase().includes(searchLower) ||
                activity.notas?.toLowerCase().includes(searchLower)
            );
        }

        if (filters.tipoId) {
            filteredActivities = filteredActivities.filter(activity => activity.tipoId === filters.tipoId);
        }

        if (filters.estado) {
            filteredActivities = filteredActivities.filter(activity => activity.estado === filters.estado);
        }

        if (filters.apartamentoId) {
            filteredActivities = filteredActivities.filter(activity => activity.apartamentoId === filters.apartamentoId);
        }

        if (filters.torreId) {
            filteredActivities = filteredActivities.filter(activity => activity.torreId === filters.torreId);
        }

        if (filters.usuarioAsignadoId) {
            filteredActivities = filteredActivities.filter(activity => activity.usuarioAsignadoId === filters.usuarioAsignadoId);
        }

        if (filters.fechaDesde) {
            filteredActivities = filteredActivities.filter(activity => 
                activity.fechaProgramada && activity.fechaProgramada >= filters.fechaDesde!
            );
        }

        if (filters.fechaHasta) {
            filteredActivities = filteredActivities.filter(activity => 
                activity.fechaProgramada && activity.fechaProgramada <= filters.fechaHasta!
            );
        }

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

        return {
            data: paginatedActivities,
            total: filteredActivities.length
        };
    }

    async getById(id: number): Promise<Activity | null> {
        const activity = this.activities.find(a => a.id === id);
        return activity || null;
    }

    async create(activity: Activity): Promise<Activity> {
        const newActivity: Activity = {
            ...activity,
            id: this.nextId++,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.activities.push(newActivity);
        return newActivity;
    }

    async update(id: number, updateData: Partial<Omit<Activity, "id" | "createdAt" | "updatedAt">>): Promise<Activity | null> {
        const activityIndex = this.activities.findIndex(a => a.id === id);
        
        if (activityIndex === -1) {
            return null;
        }

        const updatedActivity = {
            ...this.activities[activityIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.activities[activityIndex] = updatedActivity;
        return updatedActivity;
    }

    async delete(id: number): Promise<boolean> {
        const activityIndex = this.activities.findIndex(a => a.id === id);
        
        if (activityIndex === -1) {
            return false;
        }

        this.activities.splice(activityIndex, 1);
        return true;
    }

    async updateMany(list: Partial<Activity>[]): Promise<{ updated: Activity[], errors?: string[] }> {
        const updated: Activity[] = [];
        const errors: string[] = [];

        for (const item of list) {
            if (!item.id) {
                errors.push("ID is required for update");
                continue;
            }

            const result = await this.update(item.id, item);
            if (result) {
                updated.push(result);
            } else {
                errors.push(`Activity with ID ${item.id} not found`);
            }
        }

        return { updated, errors: errors.length > 0 ? errors : undefined };
    }

    async deleteMany(ids: number[]): Promise<{ deleted: Activity[], notFound?: number[] }> {
        const deleted: Activity[] = [];
        const notFound: number[] = [];

        for (const id of ids) {
            const activity = await this.getById(id);
            if (activity) {
                const success = await this.delete(id);
                if (success) {
                    deleted.push(activity);
                }
            } else {
                notFound.push(id);
            }
        }

        return { deleted, notFound: notFound.length > 0 ? notFound : undefined };
    }
}