import { Activity, ActivityFilters } from "../entities/activity.entity";

export interface ActivityRepository {
    findAll(filters: ActivityFilters): Promise<{ data: Activity[], total: number }>;
    getById(id: number): Promise<Activity | null>;
    create(activity: Activity): Promise<Activity>;
    update(id: number, updateData: Partial<Omit<Activity, "id" | "createdAt" | "updatedAt">>): Promise<Activity | null>;
    delete(id: number): Promise<boolean>;
    updateMany(list: Partial<Activity>[]): Promise<{ updated: Activity[], errors?: string[] }>;
    deleteMany(ids: number[]): Promise<{ deleted: Activity[], notFound?: number[] }>;
}