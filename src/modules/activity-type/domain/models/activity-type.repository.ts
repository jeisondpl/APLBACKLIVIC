import { ActivityType, ActivityTypeFilters } from "../entities/activity-type.entity";

export interface ActivityTypeRepository {
    findAll(filters: ActivityTypeFilters): Promise<{ data: ActivityType[], total: number }>;
    getById(id: number): Promise<ActivityType | null>;
    create(activityType: ActivityType): Promise<ActivityType>;
    update(id: number, updateData: Partial<Omit<ActivityType, "id" | "createdAt" | "updatedAt">>): Promise<ActivityType | null>;
    delete(id: number): Promise<boolean>;
}